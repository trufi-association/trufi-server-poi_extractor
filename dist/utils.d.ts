/**
 * OSM POI Extractor - Utility Functions
 *
 * This file is part of trufi-server-poi_extractor.
 * Copyright (C) 2024 Trufi Association
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import type { OSMTags, POICategory, CategoriesConfig, GeoJSONFeature, CachedNode, BoundingBox } from './types.js';
/**
 * Check if OSM tags match a category's matchers
 */
export declare function matchesCategory(tags: OSMTags, category: POICategory): boolean;
/**
 * Find which category and subcategory an element belongs to based on its tags
 * Returns: { category: string, subcategory?: string, icon: string, color: string } or null
 */
export declare function findCategory(tags: OSMTags, categories: CategoriesConfig): {
    category: string;
    subcategory?: string;
    icon: string;
    color: string;
} | null;
/**
 * Create a GeoJSON Point feature from an OSM node
 */
export declare function createPointFeature(id: number, lat: number, lon: number, tags: OSMTags, category: string, osmType?: 'node' | 'way' | 'relation', subcategory?: string): GeoJSONFeature;
/**
 * Create a GeoJSON Polygon feature from a list of nodes
 */
export declare function createPolygonFeature(nodes: CachedNode[], tags: OSMTags, osmId: number, category: string, osmType?: 'way' | 'relation', subcategory?: string): GeoJSONFeature | null;
/**
 * Calculate the centroid of a polygon
 */
export declare function calculateCentroid(nodes: CachedNode[]): {
    lat: number;
    lon: number;
} | null;
/**
 * Merge connected ways into single polygons
 */
export declare function mergeConnectedWays(ways: CachedNode[][]): CachedNode[][];
/**
 * Create a MultiPolygon feature from multiple outer ways
 */
export declare function createMultiPolygonFeature(outerWays: CachedNode[][], tags: OSMTags, osmId: number, category: string, subcategory?: string): GeoJSONFeature | null;
/**
 * Get the main tag value for type classification
 */
export declare function getMainTagValue(tags: OSMTags): string;
/**
 * Parse a bounding box string (south,west,north,east)
 */
export declare function parseBbox(bboxString: string): BoundingBox;
/**
 * Format a bounding box for display
 */
export declare function formatBbox(bbox: BoundingBox): string;
/**
 * Check if a point is within a bounding box
 */
export declare function isInBbox(lat: number, lon: number, bbox: BoundingBox): boolean;
//# sourceMappingURL=utils.d.ts.map