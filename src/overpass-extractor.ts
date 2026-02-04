/**
 * OSM POI Extractor - Overpass API Extractor
 *
 * This file is part of trufi-server-poi_extractor.
 * Copyright (C) 2024 Trufi Association
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import fs from 'fs';
import path from 'path';
import type {
  BoundingBox,
  CategoriesConfig,
  GeoJSONFeature,
  GeoJSONFeatureCollection,
  ExtractionMetadata,
  OverpassResponse,
  OverpassElement,
  CachedNode
} from './types.js';
import {
  findCategory,
  createPointFeature,
  createPolygonFeature,
  formatBbox
} from './utils.js';
import { configureIcons, preloadIcons, getCachedIcons } from './icons.js';

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';
const OVERPASS_API_TIMEOUT = 180; // seconds

export interface OverpassExtractorOptions {
  bbox: BoundingBox;
  outputDir: string;
  categories: CategoriesConfig;
  verbose?: boolean;
  endpoint?: string;
  iconFlavor?: string;
}

export interface ExtractionResult {
  poisByCategory: Record<string, GeoJSONFeature[]>;
  metadata: ExtractionMetadata;
}

/**
 * Build Overpass QL query for all categories
 */
function buildOverpassQuery(bbox: BoundingBox, categories: CategoriesConfig): string {
  const { south, west, north, east } = bbox;
  const bboxStr = `${south},${west},${north},${east}`;

  const queries: string[] = [];

  for (const [_name, category] of Object.entries(categories)) {
    // Process category-level matchers if they exist
    if (category.matchers) {
      for (const matcher of category.matchers) {
        if (matcher.values === null) {
          // Match any value for this key
          queries.push(`node["${matcher.key}"](${bboxStr});`);
          queries.push(`way["${matcher.key}"](${bboxStr});`);
          queries.push(`relation["${matcher.key}"](${bboxStr});`);
        } else {
          for (const value of matcher.values) {
            queries.push(`node["${matcher.key}"="${value}"](${bboxStr});`);
            queries.push(`way["${matcher.key}"="${value}"](${bboxStr});`);
            queries.push(`relation["${matcher.key}"="${value}"](${bboxStr});`);
          }
        }
      }
    }

    // Process subcategory matchers if they exist
    if (category.subcategories && category.subcategories.length > 0) {
      for (const subcategory of category.subcategories) {
        for (const matcher of subcategory.matchers) {
          if (matcher.values === null) {
            queries.push(`node["${matcher.key}"](${bboxStr});`);
            queries.push(`way["${matcher.key}"](${bboxStr});`);
            queries.push(`relation["${matcher.key}"](${bboxStr});`);
          } else {
            for (const value of matcher.values) {
              queries.push(`node["${matcher.key}"="${value}"](${bboxStr});`);
              queries.push(`way["${matcher.key}"="${value}"](${bboxStr});`);
              queries.push(`relation["${matcher.key}"="${value}"](${bboxStr});`);
            }
          }
        }
      }
    }
  }

  return `
[out:json][timeout:${OVERPASS_API_TIMEOUT}];
(
  ${queries.join('\n  ')}
);
out body;
>;
out skel qt;
`.trim();
}

/**
 * Fetch data from Overpass API
 */
async function fetchOverpass(query: string, endpoint: string): Promise<OverpassResponse> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<OverpassResponse>;
}

interface ProcessResult {
  poisByCategory: Record<string, GeoJSONFeature[]>;
}

/**
 * Process Overpass response into POIs
 */
function processOverpassResponse(
  data: OverpassResponse,
  categories: CategoriesConfig
): ProcessResult {
  const poisByCategory: Record<string, GeoJSONFeature[]> = {};
  for (const name of Object.keys(categories)) {
    poisByCategory[name] = [];
  }

  // Build node cache for way geometry
  const nodeCache = new Map<number, CachedNode>();
  for (const element of data.elements) {
    if (element.type === 'node' && element.lat !== undefined && element.lon !== undefined) {
      nodeCache.set(element.id, { lat: element.lat, lon: element.lon });
    }
  }

  // Process elements
  for (const element of data.elements) {
    if (!element.tags) continue;

    const categoryMatch = findCategory(element.tags, categories);
    if (!categoryMatch) continue;

    if (element.type === 'node' && element.lat !== undefined && element.lon !== undefined) {
      const feature = createPointFeature(
        element.id,
        element.lat,
        element.lon,
        element.tags,
        categoryMatch.category,
        'node',
        categoryMatch.subcategory
      );
      poisByCategory[categoryMatch.category].push(feature);
    } else if (element.type === 'way' && element.nodes && element.nodes.length > 0) {
      // Get way geometry from node cache or inline geometry
      let wayNodes: CachedNode[];

      if (element.geometry) {
        wayNodes = element.geometry;
      } else {
        wayNodes = element.nodes
          .map(nodeId => nodeCache.get(nodeId))
          .filter((n): n is CachedNode => n !== undefined);
      }

      if (wayNodes.length >= 3) {
        const feature = createPolygonFeature(
          wayNodes,
          element.tags,
          element.id,
          categoryMatch.category,
          'way',
          categoryMatch.subcategory
        );
        if (feature) {
          poisByCategory[categoryMatch.category].push(feature);
        }
      } else if (wayNodes.length > 0) {
        // Fall back to centroid point
        const lat = wayNodes.reduce((sum, n) => sum + n.lat, 0) / wayNodes.length;
        const lon = wayNodes.reduce((sum, n) => sum + n.lon, 0) / wayNodes.length;
        const feature = createPointFeature(
          element.id,
          lat,
          lon,
          element.tags,
          categoryMatch.category,
          'way',
          categoryMatch.subcategory
        );
        poisByCategory[categoryMatch.category].push(feature);
      }
    } else if (element.type === 'relation') {
      // For relations, try to get center point from members
      // This is a simplified approach; full multipolygon support would need more work
      if (element.tags.name) {
        // Try to find a representative point from member nodes
        let centerLat = 0;
        let centerLon = 0;
        let count = 0;

        if (element.members) {
          for (const member of element.members) {
            if (member.type === 'node') {
              const node = nodeCache.get(member.ref);
              if (node) {
                centerLat += node.lat;
                centerLon += node.lon;
                count++;
              }
            }
          }
        }

        if (count > 0) {
          const feature = createPointFeature(
            element.id,
            centerLat / count,
            centerLon / count,
            element.tags,
            categoryMatch.category,
            'relation',
            categoryMatch.subcategory
          );
          poisByCategory[categoryMatch.category].push(feature);
        }
      }
    }
  }

  return { poisByCategory };
}

export async function extractFromOverpass(options: OverpassExtractorOptions): Promise<ExtractionResult> {
  const {
    bbox,
    outputDir,
    categories,
    verbose = false,
    endpoint = OVERPASS_API_URL,
    iconFlavor
  } = options;

  const log = verbose ? console.log.bind(console) : () => {};

  // Configure icon flavor if specified
  if (iconFlavor) {
    configureIcons({ flavor: iconFlavor });
  }

  log('POI Extractor - Overpass API Mode');
  log('=================================');
  log(`Bbox: ${formatBbox(bbox)}`);
  log(`Output: ${outputDir}`);
  log(`Endpoint: ${endpoint}`);
  if (iconFlavor) {
    log(`Icon flavor: ${iconFlavor}`);
  }
  log('');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Build and execute query
  log('Building Overpass query...');
  const query = buildOverpassQuery(bbox, categories);

  if (verbose) {
    log('Query:');
    log(query);
    log('');
  }

  log('Fetching data from Overpass API...');
  log('(This may take a while depending on the bbox size)');
  log('');

  const data = await fetchOverpass(query, endpoint);

  log(`Received ${data.elements.length} elements`);
  log('');

  // Load icons
  log('Loading icons...');
  preloadIcons(categories);
  const iconCache = getCachedIcons();

  // Process response
  log('Processing elements...');
  const { poisByCategory } = processOverpassResponse(data, categories);

  // Calculate totals
  const counts: Record<string, number> = {};
  let total = 0;
  for (const [name, pois] of Object.entries(poisByCategory)) {
    counts[name] = pois.length;
    total += pois.length;
    if (verbose) {
      log(`  ${categories[name].displayName.en}: ${pois.length}`);
    }
  }
  log('');
  log(`Total POIs found: ${total}`);
  log('');

  // Write GeoJSON files
  log('Writing GeoJSON files...');
  for (const [name, pois] of Object.entries(poisByCategory)) {
    const geojson: GeoJSONFeatureCollection = {
      type: 'FeatureCollection',
      features: pois
    };

    const outputFile = path.join(outputDir, `${name}.geojson`);
    fs.writeFileSync(outputFile, JSON.stringify(geojson, null, 2));
  }

  // Create metadata with subcategory counts and icons
  const metadata: ExtractionMetadata = {
    generated: new Date().toISOString(),
    source: `overpass-api:${formatBbox(bbox)}`,
    bbox,
    categories: Object.keys(categories).map(name => {
      const category = categories[name];
      const categoryPOIs = poisByCategory[name];

      // Calculate subcategory counts with icons and colors
      let subcategoriesMetadata;
      if (category.subcategories && category.subcategories.length > 0) {
        subcategoriesMetadata = category.subcategories.map(sub => {
          const subPOIs = categoryPOIs.filter(poi => poi.properties.subcategory === sub.name);
          const icon = iconCache.get(sub.icon);

          return {
            name: sub.name,
            displayName: sub.displayName.en,
            'displayName:en': sub.displayName.en,
            'displayName:es': sub.displayName.es,
            'displayName:de': sub.displayName.de,
            defaultActive: sub.defaultActive,
            count: subPOIs.length,
            icon,
            color: sub.color
          };
        });
      }

      // For categories without subcategories, get category-level icon and color
      let categoryIcon;
      let categoryColor;
      if (category.icon) {
        categoryIcon = iconCache.get(category.icon);
      }
      if ('color' in category) {
        categoryColor = category.color;
      }

      return {
        name,
        displayName: category.displayName.en,
        'displayName:en': category.displayName.en,
        'displayName:es': category.displayName.es,
        'displayName:de': category.displayName.de,
        count: counts[name],
        icon: categoryIcon,
        color: categoryColor,
        subcategories: subcategoriesMetadata
      };
    }),
    total
  };

  const metadataFile = path.join(outputDir, 'metadata.json');
  fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));

  log('');
  log(`Done! Output written to: ${outputDir}`);

  return { poisByCategory, metadata };
}
