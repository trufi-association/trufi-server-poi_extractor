/**
 * OSM POI Extractor - PBF File Extractor
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
import parseOSM from 'osm-pbf-parser';
import through2 from 'through2';
import type {
  OSMElement,
  CategoriesConfig,
  GeoJSONFeature,
  GeoJSONFeatureCollection,
  ExtractionMetadata,
  CachedNode,
  BoundingBox
} from './types.js';
import {
  findCategory,
  createPointFeature,
  createPolygonFeature,
  createMultiPolygonFeature,
  isInBbox
} from './utils.js';
import { configureIcons, preloadIcons, getCachedIcons } from './icons.js';

export interface PBFExtractorOptions {
  inputFile: string;
  outputDir: string;
  categories: CategoriesConfig;
  bbox?: BoundingBox;
  verbose?: boolean;
  iconFlavor?: string;
}

export interface ExtractionResult {
  poisByCategory: Record<string, GeoJSONFeature[]>;
  metadata: ExtractionMetadata;
}

export async function extractFromPBF(options: PBFExtractorOptions): Promise<ExtractionResult> {
  const { inputFile, outputDir, categories, bbox, verbose = false, iconFlavor } = options;

  const log = verbose ? console.log.bind(console) : () => {};

  // Configure icon flavor if specified
  if (iconFlavor) {
    configureIcons({ flavor: iconFlavor });
  }

  log('POI Extractor - PBF Mode');
  log('========================');
  log(`Input: ${inputFile}`);
  log(`Output: ${outputDir}`);
  if (bbox) {
    log(`Bbox: ${bbox.south},${bbox.west},${bbox.north},${bbox.east}`);
  }
  if (iconFlavor) {
    log(`Icon flavor: ${iconFlavor}`);
  }
  log('');

  if (!fs.existsSync(inputFile)) {
    throw new Error(`Input file not found: ${inputFile}`);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const poisByCategory: Record<string, GeoJSONFeature[]> = {};
  for (const name of Object.keys(categories)) {
    poisByCategory[name] = [];
  }

  // Load icons from categories
  log('Loading icons...');
  preloadIcons(categories);
  const iconCache = getCachedIcons();

  log('Parsing PBF file...');

  const osm = parseOSM();
  let nodeCount = 0;
  let wayCount = 0;
  let relationCount = 0;
  let poiCount = 0;
  const nodeCache = new Map<number, CachedNode>();
  const wayCache = new Map<number, CachedNode[]>();

  return new Promise((resolve, reject) => {
    fs.createReadStream(inputFile)
      .pipe(osm)
      .pipe(through2.obj(function (items: OSMElement[], _enc, next) {
        for (const item of items) {
          // Cache all nodes for way/relation processing
          if (item.type === 'node') {
            // Skip if outside bbox
            if (bbox && !isInBbox(item.lat, item.lon, bbox)) {
              continue;
            }

            nodeCache.set(item.id, { lat: item.lat, lon: item.lon });

            if (item.tags) {
              nodeCount++;

              const categoryMatch = findCategory(item.tags, categories);
              if (categoryMatch) {
                const feature = createPointFeature(
                  item.id,
                  item.lat,
                  item.lon,
                  item.tags,
                  categoryMatch.category,
                  'node',
                  categoryMatch.subcategory
                );
                poisByCategory[categoryMatch.category].push(feature);
                poiCount++;
              }

              if (verbose && nodeCount % 10000 === 0) {
                log(`Processed ${nodeCount} nodes, ${wayCount} ways, found ${poiCount} POIs...`);
              }
            }
          }

          // Process ways
          if (item.type === 'way' && item.refs && item.refs.length > 0) {
            wayCount++;

            const wayNodes = item.refs
              .map(ref => nodeCache.get(ref))
              .filter((n): n is CachedNode => n !== undefined);

            const completeness = wayNodes.length / item.refs.length;

            if (wayNodes.length >= 3 && completeness >= 0.9) {
              wayCache.set(item.id, wayNodes);
            }

            if (item.tags) {
              const categoryMatch = findCategory(item.tags, categories);
              if (categoryMatch && wayNodes.length >= 3 && completeness >= 0.9) {
                const hasName = item.tags?.name && !item.tags.name.toLowerCase().includes('jardinera');
                const isLargeEnough = wayNodes.length >= 15;

                if (hasName || isLargeEnough) {
                  const feature = createPolygonFeature(
                    wayNodes,
                    item.tags,
                    item.id,
                    categoryMatch.category,
                    'way',
                    categoryMatch.subcategory
                  );
                  if (feature) {
                    poisByCategory[categoryMatch.category].push(feature);
                    poiCount++;
                  }
                }
              }
            }

            if (verbose && wayCount % 5000 === 0) {
              log(`Processed ${nodeCount} nodes, ${wayCount} ways, found ${poiCount} POIs...`);
            }
          }

          // Process relations
          if (item.type === 'relation' && item.tags) {
            relationCount++;

            const categoryMatch = findCategory(item.tags, categories);
            if (categoryMatch && item.tags.type === 'multipolygon') {
              const outerWays: CachedNode[][] = [];

              for (const member of item.members || []) {
                if (member.type === 'way' && member.role === 'outer') {
                  const memberId = (member as { ref?: number; id?: number }).ref || (member as { ref?: number; id?: number }).id;
                  if (memberId) {
                    const wayGeometry = wayCache.get(memberId);
                    if (wayGeometry) {
                      outerWays.push(wayGeometry);
                    }
                  }
                }
              }

              if (outerWays.length > 0) {
                const hasName = item.tags?.name && !item.tags.name.toLowerCase().includes('jardinera');
                const totalNodes = outerWays.reduce((sum, way) => sum + way.length, 0);

                if (totalNodes >= 15 || hasName) {
                  const feature = createMultiPolygonFeature(
                    outerWays,
                    item.tags,
                    item.id,
                    categoryMatch.category,
                    categoryMatch.subcategory
                  );
                  if (feature) {
                    poisByCategory[categoryMatch.category].push(feature);
                    poiCount++;
                  }
                }
              }
            }

            if (verbose && relationCount % 1000 === 0) {
              log(`Processed ${nodeCount} nodes, ${wayCount} ways, ${relationCount} relations, found ${poiCount} POIs...`);
            }
          }
        }
        next();
      }))
      .on('finish', () => {
        log('');
        log(`Total: ${nodeCount} nodes, ${wayCount} ways, ${relationCount} relations processed, ${poiCount} POIs found`);
        log('');

        const counts: Record<string, number> = {};
        for (const [name, pois] of Object.entries(poisByCategory)) {
          counts[name] = pois.length;
          if (verbose) {
            log(`  ${categories[name].displayName.en}: ${pois.length}`);
          }
        }
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
          source: path.basename(inputFile),
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
          total: poiCount
        };

        const metadataFile = path.join(outputDir, 'metadata.json');
        fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));

        log('');
        log(`Done! Output written to: ${outputDir}`);

        resolve({ poisByCategory, metadata });
      })
      .on('error', reject);
  });
}
