/**
 * OSM POI Extractor - Icon Loading
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
import { fileURLToPath } from 'url';
import type { CategoriesConfig } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default icons directory (relative to package root)
const DEFAULT_ICONS_DIR = path.resolve(__dirname, '..', 'icons');
const DEFAULT_FLAVOR = 'maki';

// Cache for loaded SVGs
const svgCache = new Map<string, string>();

// Current configuration
let currentIconsDir = DEFAULT_ICONS_DIR;
let currentFlavor = DEFAULT_FLAVOR;

/**
 * Configure the icons directory and flavor
 */
export function configureIcons(options: { iconsDir?: string; flavor?: string }): void {
  if (options.iconsDir) {
    currentIconsDir = options.iconsDir;
  }
  if (options.flavor) {
    currentFlavor = options.flavor;
  }
}

/**
 * Get the path to an icon file
 */
function getIconPath(iconName: string, flavor?: string): string {
  const flavorToUse = flavor || currentFlavor;
  return path.join(currentIconsDir, flavorToUse, `${iconName}.svg`);
}

/**
 * Load an icon from the local filesystem
 */
export function loadIcon(iconName: string, flavor?: string): string | null {
  const cacheKey = `${flavor || currentFlavor}:${iconName}`;

  // Check cache first
  if (svgCache.has(cacheKey)) {
    return svgCache.get(cacheKey)!;
  }

  const iconPath = getIconPath(iconName, flavor);

  try {
    if (fs.existsSync(iconPath)) {
      const svg = fs.readFileSync(iconPath, 'utf-8');
      svgCache.set(cacheKey, svg);
      return svg;
    }
  } catch {
    // Ignore errors, return null
  }

  return null;
}

/**
 * Preload icons from categories configuration
 */
export function preloadIcons(categories: CategoriesConfig, flavor?: string): void {
  const flavorToUse = flavor || currentFlavor;
  const iconNames = new Set<string>();

  // Collect all icon names from categories
  for (const category of Object.values(categories)) {
    // Category-level icon
    if (category.icon) {
      iconNames.add(category.icon);
    }

    // Subcategory icons
    if (category.subcategories) {
      for (const sub of category.subcategories) {
        iconNames.add(sub.icon);
      }
    }
  }

  console.log(`Loading ${iconNames.size} icons from ${flavorToUse}...`);

  let loaded = 0;
  let missing = 0;

  for (const iconName of iconNames) {
    const svg = loadIcon(iconName, flavorToUse);
    if (svg) {
      loaded++;
    } else {
      missing++;
      console.warn(`  Warning: Icon not found: ${iconName}`);
    }
  }

  console.log(`Icons loaded: ${loaded}, missing: ${missing}`);
}

/**
 * Get all cached icons
 */
export function getCachedIcons(): Map<string, string> {
  // Return a map with just icon names (without flavor prefix) for compatibility
  const result = new Map<string, string>();
  for (const [key, value] of svgCache) {
    const iconName = key.split(':')[1];
    result.set(iconName, value);
  }
  return result;
}

/**
 * Clear icon cache
 */
export function clearIconCache(): void {
  svgCache.clear();
}

/**
 * List available icon flavors
 */
export function listFlavors(iconsDir?: string): string[] {
  const dir = iconsDir || currentIconsDir;
  try {
    if (!fs.existsSync(dir)) {
      return [];
    }
    return fs.readdirSync(dir).filter(name => {
      const flavorPath = path.join(dir, name);
      return fs.statSync(flavorPath).isDirectory();
    });
  } catch {
    return [];
  }
}

/**
 * List available icons in a flavor
 */
export function listIcons(flavor?: string, iconsDir?: string): string[] {
  const dir = iconsDir || currentIconsDir;
  const flavorToUse = flavor || currentFlavor;
  const flavorPath = path.join(dir, flavorToUse);

  try {
    if (!fs.existsSync(flavorPath)) {
      return [];
    }
    return fs.readdirSync(flavorPath)
      .filter(name => name.endsWith('.svg'))
      .map(name => name.replace('.svg', ''));
  } catch {
    return [];
  }
}
