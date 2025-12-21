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

export interface PBFExtractorOptions {
  inputFile: string;
  outputDir: string;
  categories: CategoriesConfig;
  bbox?: BoundingBox;
  verbose?: boolean;
}

export interface ExtractionResult {
  poisByCategory: Record<string, GeoJSONFeature[]>;
  metadata: ExtractionMetadata;
}

export async function extractFromPBF(options: PBFExtractorOptions): Promise<ExtractionResult> {
  const { inputFile, outputDir, categories, bbox, verbose = false } = options;

  const log = verbose ? console.log.bind(console) : () => {};

  log('POI Extractor - PBF Mode');
  log('========================');
  log(`Input: ${inputFile}`);
  log(`Output: ${outputDir}`);
  if (bbox) {
    log(`Bbox: ${bbox.south},${bbox.west},${bbox.north},${bbox.east}`);
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

              const category = findCategory(item.tags, categories);
              if (category) {
                const feature = createPointFeature(
                  item.id,
                  item.lat,
                  item.lon,
                  item.tags,
                  category,
                  'node'
                );
                poisByCategory[category].push(feature);
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
              const category = findCategory(item.tags, categories);
              if (category && wayNodes.length >= 3 && completeness >= 0.9) {
                const hasName = item.tags?.name && !item.tags.name.toLowerCase().includes('jardinera');
                const isLargeEnough = wayNodes.length >= 15;

                if (hasName || isLargeEnough) {
                  const feature = createPolygonFeature(wayNodes, item.tags, item.id, category, 'way');
                  if (feature) {
                    poisByCategory[category].push(feature);
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

            const category = findCategory(item.tags, categories);
            if (category && item.tags.type === 'multipolygon') {
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
                  const feature = createMultiPolygonFeature(outerWays, item.tags, item.id, category);
                  if (feature) {
                    poisByCategory[category].push(feature);
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
            log(`  ${categories[name].displayName}: ${pois.length}`);
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

        // Create metadata
        const metadata: ExtractionMetadata = {
          generated: new Date().toISOString(),
          source: path.basename(inputFile),
          bbox,
          categories: Object.keys(categories).map(name => ({
            name,
            displayName: categories[name].displayName,
            count: counts[name]
          })),
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
