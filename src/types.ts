/**
 * OSM POI Extractor - Type Definitions
 *
 * This file is part of trufi-server-poi_extractor.
 * Copyright (C) 2024 Trufi Association
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

// OSM Element Types
export interface OSMTags {
  [key: string]: string;
}

export interface OSMNode {
  type: 'node';
  id: number;
  lat: number;
  lon: number;
  tags?: OSMTags;
}

export interface OSMWay {
  type: 'way';
  id: number;
  tags?: OSMTags;
  refs?: number[];
}

export interface OSMRelation {
  type: 'relation';
  id: number;
  tags?: OSMTags;
  members?: Array<{
    type: 'node' | 'way' | 'relation';
    ref: number;
    role: string;
  }>;
}

export type OSMElement = OSMNode | OSMWay | OSMRelation;

// Category Configuration Types
export interface TagMatcher {
  key: string;
  values: string[] | null; // null means match any value
}

export interface POISubcategory {
  name: string;
  displayName: string;
  matchers: TagMatcher[];
}

export interface POICategory {
  displayName: string;
  matchers?: TagMatcher[]; // Optional for categories with only subcategories
  subcategories?: POISubcategory[];
}

export type CategoriesConfig = Record<string, POICategory>;

// GeoJSON Types
export interface GeoJSONPointGeometry {
  type: 'Point';
  coordinates: [number, number];
}

export interface GeoJSONPolygonGeometry {
  type: 'Polygon';
  coordinates: [number, number][][];
}

export interface GeoJSONMultiPolygonGeometry {
  type: 'MultiPolygon';
  coordinates: [number, number][][][];
}

export type GeoJSONGeometry = GeoJSONPointGeometry | GeoJSONPolygonGeometry | GeoJSONMultiPolygonGeometry;

export interface GeoJSONFeature {
  type: 'Feature';
  id: number;
  geometry: GeoJSONGeometry;
  properties: {
    id: number;
    name: string;
    type: string;
    category: string;
    subcategory?: string;
    osmType: 'node' | 'way' | 'relation';
    [key: string]: string | number | undefined;
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// Metadata Types
export interface SubcategoryMetadata {
  name: string;
  displayName: string;
  count: number;
}

export interface CategoryMetadata {
  name: string;
  displayName: string;
  count: number;
  subcategories?: SubcategoryMetadata[];
}

export interface ExtractionMetadata {
  generated: string;
  source: string;
  bbox?: BoundingBox;
  categories: CategoryMetadata[];
  total: number;
}

// Bounding Box
export interface BoundingBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

// Node Cache for Way/Relation Processing
export interface CachedNode {
  lat: number;
  lon: number;
}

// CLI Options
export interface ExtractorOptions {
  input?: string;
  output: string;
  bbox?: BoundingBox;
  categories?: string[];
  format?: 'geojson' | 'json';
  verbose?: boolean;
}

// Overpass API Types
export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  tags?: OSMTags;
  nodes?: number[];
  members?: Array<{
    type: 'node' | 'way' | 'relation';
    ref: number;
    role: string;
  }>;
  geometry?: Array<{ lat: number; lon: number }>;
}

export interface OverpassResponse {
  version: number;
  generator: string;
  elements: OverpassElement[];
}
