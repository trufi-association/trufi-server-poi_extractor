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
// Export extractors
export { extractFromPBF } from './pbf-extractor.js';
export { extractFromOverpass } from './overpass-extractor.js';
// Export categories
export { CATEGORIES, loadCategories } from './categories.js';
// Export utilities
export { matchesCategory, findCategory, createPointFeature, createPolygonFeature, createMultiPolygonFeature, calculateCentroid, mergeConnectedWays, parseBbox, formatBbox, isInBbox, getMainTagValue, MAIN_TAG_KEYS, isAnnotationTag } from './utils.js';
// Export icon utilities
export { configureIcons, loadIcon, preloadIcons, getCachedIcons, clearIconCache, listFlavors, listIcons } from './icons.js';
//# sourceMappingURL=index.js.map