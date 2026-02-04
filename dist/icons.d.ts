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
import type { CategoriesConfig } from './types.js';
/**
 * Configure the icons directory and flavor
 */
export declare function configureIcons(options: {
    iconsDir?: string;
    flavor?: string;
}): void;
/**
 * Load an icon from the local filesystem
 */
export declare function loadIcon(iconName: string, flavor?: string): string | null;
/**
 * Preload icons from categories configuration
 */
export declare function preloadIcons(categories: CategoriesConfig, flavor?: string): void;
/**
 * Get all cached icons
 */
export declare function getCachedIcons(): Map<string, string>;
/**
 * Clear icon cache
 */
export declare function clearIconCache(): void;
/**
 * List available icon flavors
 */
export declare function listFlavors(iconsDir?: string): string[];
/**
 * List available icons in a flavor
 */
export declare function listIcons(flavor?: string, iconsDir?: string): string[];
//# sourceMappingURL=icons.d.ts.map