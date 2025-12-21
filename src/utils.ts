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

import type {
  OSMTags,
  OSMNode,
  POICategory,
  CategoriesConfig,
  GeoJSONFeature,
  CachedNode,
  BoundingBox
} from './types.js';

/**
 * Check if OSM tags match a category's matchers
 */
export function matchesCategory(tags: OSMTags, category: POICategory): boolean {
  for (const matcher of category.matchers) {
    if (tags[matcher.key]) {
      if (matcher.values === null || matcher.values.includes(tags[matcher.key])) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Find which category an element belongs to based on its tags
 */
export function findCategory(tags: OSMTags, categories: CategoriesConfig): string | null {
  for (const [name, category] of Object.entries(categories)) {
    if (matchesCategory(tags, category)) {
      return name;
    }
  }
  return null;
}

/**
 * Create a GeoJSON Point feature from an OSM node
 */
export function createPointFeature(
  id: number,
  lat: number,
  lon: number,
  tags: OSMTags,
  category: string,
  osmType: 'node' | 'way' | 'relation' = 'node'
): GeoJSONFeature {
  return {
    type: 'Feature',
    id,
    geometry: {
      type: 'Point',
      coordinates: [lon, lat]
    },
    properties: {
      id,
      name: tags?.name || '',
      type: getMainTagValue(tags),
      category,
      osmType,
      ...tags
    }
  };
}

/**
 * Create a GeoJSON Polygon feature from a list of nodes
 */
export function createPolygonFeature(
  nodes: CachedNode[],
  tags: OSMTags,
  osmId: number,
  category: string,
  osmType: 'way' | 'relation' = 'way'
): GeoJSONFeature | null {
  if (!nodes || nodes.length < 3) return null;

  const coordinates: [number, number][] = nodes.map(n => [n.lon, n.lat]);

  // Close the polygon if not already closed
  const isClosed = coordinates.length > 0 &&
    coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
    coordinates[0][1] === coordinates[coordinates.length - 1][1];

  if (!isClosed && coordinates.length > 0) {
    coordinates.push([...coordinates[0]]);
  }

  return {
    type: 'Feature',
    id: osmId,
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates]
    },
    properties: {
      id: osmId,
      name: tags?.name || '',
      type: getMainTagValue(tags),
      category,
      osmType,
      ...tags
    }
  };
}

/**
 * Calculate the centroid of a polygon
 */
export function calculateCentroid(nodes: CachedNode[]): { lat: number; lon: number } | null {
  if (!nodes || nodes.length === 0) return null;

  let lat = 0, lon = 0;
  for (const node of nodes) {
    lat += node.lat;
    lon += node.lon;
  }

  return {
    lat: lat / nodes.length,
    lon: lon / nodes.length
  };
}

/**
 * Merge connected ways into single polygons
 */
export function mergeConnectedWays(ways: CachedNode[][]): CachedNode[][] {
  if (ways.length <= 1) return ways;

  const merged: CachedNode[][] = [];
  const used = new Set<number>();

  for (let i = 0; i < ways.length; i++) {
    if (used.has(i)) continue;

    let currentWay = [...ways[i]];
    used.add(i);
    let foundConnection = true;

    while (foundConnection) {
      foundConnection = false;

      for (let j = 0; j < ways.length; j++) {
        if (used.has(j)) continue;

        const way = ways[j];
        const currentFirst = currentWay[0];
        const currentLast = currentWay[currentWay.length - 1];
        const wayFirst = way[0];
        const wayLast = way[way.length - 1];

        const sameNode = (n1: CachedNode, n2: CachedNode) =>
          Math.abs(n1.lat - n2.lat) < 0.0000001 && Math.abs(n1.lon - n2.lon) < 0.0000001;

        if (sameNode(currentLast, wayFirst)) {
          currentWay = currentWay.concat(way.slice(1));
          used.add(j);
          foundConnection = true;
          break;
        } else if (sameNode(currentLast, wayLast)) {
          currentWay = currentWay.concat(way.slice(0, -1).reverse());
          used.add(j);
          foundConnection = true;
          break;
        } else if (sameNode(currentFirst, wayLast)) {
          currentWay = way.concat(currentWay.slice(1));
          used.add(j);
          foundConnection = true;
          break;
        } else if (sameNode(currentFirst, wayFirst)) {
          currentWay = way.slice(1).reverse().concat(currentWay);
          used.add(j);
          foundConnection = true;
          break;
        }
      }
    }

    merged.push(currentWay);
  }

  return merged;
}

/**
 * Create a MultiPolygon feature from multiple outer ways
 */
export function createMultiPolygonFeature(
  outerWays: CachedNode[][],
  tags: OSMTags,
  osmId: number,
  category: string
): GeoJSONFeature | null {
  if (!outerWays || outerWays.length === 0) return null;

  const mergedWays = mergeConnectedWays(outerWays);
  const polygons: [number, number][][] = [];

  for (const nodes of mergedWays) {
    if (nodes.length < 3) continue;

    const coordinates: [number, number][] = nodes.map(n => [n.lon, n.lat]);

    const isClosed = coordinates.length > 0 &&
      coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
      coordinates[0][1] === coordinates[coordinates.length - 1][1];

    if (!isClosed && coordinates.length > 0) {
      coordinates.push([...coordinates[0]]);
    }

    polygons.push(coordinates);
  }

  if (polygons.length === 0) return null;

  const geometry = polygons.length === 1
    ? { type: 'Polygon' as const, coordinates: [polygons[0]] }
    : { type: 'MultiPolygon' as const, coordinates: polygons.map(p => [p]) };

  return {
    type: 'Feature',
    id: osmId,
    geometry,
    properties: {
      id: osmId,
      name: tags?.name || '',
      type: getMainTagValue(tags),
      category,
      osmType: 'relation',
      ...tags
    }
  };
}

/**
 * Get the main tag value for type classification
 */
function getMainTagValue(tags: OSMTags): string {
  if (!tags) return 'unknown';
  const priorityKeys = ['amenity', 'tourism', 'shop', 'leisure', 'healthcare', 'historic', 'public_transport'];
  for (const key of priorityKeys) {
    if (tags[key]) return tags[key];
  }
  return tags[Object.keys(tags)[0]] || 'unknown';
}

/**
 * Parse a bounding box string (south,west,north,east)
 */
export function parseBbox(bboxString: string): BoundingBox {
  const parts = bboxString.split(',').map(s => parseFloat(s.trim()));
  if (parts.length !== 4 || parts.some(isNaN)) {
    throw new Error('Invalid bbox format. Expected: south,west,north,east');
  }
  const [south, west, north, east] = parts;
  if (south >= north) {
    throw new Error('Invalid bbox: south must be less than north');
  }
  if (west >= east) {
    throw new Error('Invalid bbox: west must be less than east');
  }
  return { south, west, north, east };
}

/**
 * Format a bounding box for display
 */
export function formatBbox(bbox: BoundingBox): string {
  return `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;
}

/**
 * Check if a point is within a bounding box
 */
export function isInBbox(lat: number, lon: number, bbox: BoundingBox): boolean {
  return lat >= bbox.south && lat <= bbox.north && lon >= bbox.west && lon <= bbox.east;
}
