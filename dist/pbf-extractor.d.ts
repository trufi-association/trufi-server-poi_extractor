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
import type { CategoriesConfig, GeoJSONFeature, ExtractionMetadata, BoundingBox } from './types.js';
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
export declare function extractFromPBF(options: PBFExtractorOptions): Promise<ExtractionResult>;
//# sourceMappingURL=pbf-extractor.d.ts.map