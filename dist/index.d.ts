/**
 * OSM POI Extractor
 *
 * A tool to extract Points of Interest (POIs) from OpenStreetMap data.
 * Supports both PBF files and Overpass API queries.
 *
 * This file is part of trufi-server-poi_extractor.
 * Copyright (C) 2024 Trufi Association
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
export type { OSMTags, OSMNode, OSMWay, OSMRelation, OSMElement, TagMatcher, POICategory, CategoriesConfig, GeoJSONFeature, GeoJSONFeatureCollection, ExtractionMetadata, BoundingBox, CachedNode, ExtractorOptions, OverpassElement, OverpassResponse } from './types.js';
export { extractFromPBF } from './pbf-extractor.js';
export type { PBFExtractorOptions } from './pbf-extractor.js';
export { extractFromOverpass } from './overpass-extractor.js';
export type { OverpassExtractorOptions } from './overpass-extractor.js';
export { DEFAULT_CATEGORIES, loadCategories } from './categories.js';
export { matchesCategory, findCategory, createPointFeature, createPolygonFeature, createMultiPolygonFeature, calculateCentroid, mergeConnectedWays, parseBbox, formatBbox, isInBbox } from './utils.js';
//# sourceMappingURL=index.d.ts.map