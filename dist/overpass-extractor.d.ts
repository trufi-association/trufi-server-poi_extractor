/**
 * OSM POI Extractor - Overpass API Extractor
 *
 * This file is part of trufi-server-poi_extractor.
 * Copyright (C) 2024 Trufi Association
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import type { BoundingBox, CategoriesConfig, GeoJSONFeature, ExtractionMetadata } from './types.js';
export interface OverpassExtractorOptions {
    bbox: BoundingBox;
    outputDir: string;
    categories: CategoriesConfig;
    verbose?: boolean;
    endpoint?: string;
}
export interface ExtractionResult {
    poisByCategory: Record<string, GeoJSONFeature[]>;
    metadata: ExtractionMetadata;
}
export declare function extractFromOverpass(options: OverpassExtractorOptions): Promise<ExtractionResult>;
//# sourceMappingURL=overpass-extractor.d.ts.map