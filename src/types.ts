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

// Localized string for translations
export interface LocalizedString {
  en: string;
  es: string;
  de: string;
}

export interface POISubcategory {
  name: string;
  displayName: LocalizedString;
  icon: string; // Icon name (e.g., 'hospital', 'school')
  color: string; // Hex color (e.g., '#E53935')
  defaultActive: boolean; // Whether this subcategory is shown by default in the UI
  matchers: TagMatcher[];
}

// Category with subcategories - each subcategory has its own icon
export interface POICategoryWithSubcategories {
  displayName: LocalizedString;
  icon: string; // Category-level icon (e.g., for category headers)
  subcategories: POISubcategory[];
  matchers?: never;
}

// Category without subcategories - must have its own icon and matchers
export interface POICategoryWithMatchers {
  displayName: LocalizedString;
  icon: string; // Required when no subcategories
  color: string; // Hex color (e.g., '#7B1FA2')
  matchers: TagMatcher[];
  subcategories?: never;
}

export type POICategory = POICategoryWithSubcategories | POICategoryWithMatchers;

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

// Metadata Types (using OSM-style localized keys)
export interface SubcategoryMetadata {
  name: string;
  displayName: string; // Default (English)
  'displayName:en': string;
  'displayName:es': string;
  'displayName:de': string;
  defaultActive: boolean; // Whether this subcategory is shown by default in the UI
  count: number;
  icon?: string; // SVG content for this subcategory
  color?: string; // Hex color for this subcategory
}

export interface CategoryMetadata {
  name: string;
  displayName: string; // Default (English)
  'displayName:en': string;
  'displayName:es': string;
  'displayName:de': string;
  count: number;
  icon?: string; // SVG content for categories without subcategories
  color?: string; // Hex color for categories without subcategories
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
