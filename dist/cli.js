#!/usr/bin/env node
/**
 * OSM POI Extractor - CLI
 *
 * This file is part of trufi-server-poi_extractor.
 * Copyright (C) 2024 Trufi Association
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { parseArgs } from 'node:util';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractFromPBF } from './pbf-extractor.js';
import { extractFromOverpass } from './overpass-extractor.js';
import { DEFAULT_CATEGORIES, loadCategories } from './categories.js';
import { parseBbox } from './utils.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VERSION = '1.0.0';
const HELP = `
trufi-server-poi_extractor - Extract POIs from OpenStreetMap data

USAGE:
  poi-extractor --input <file.osm.pbf> --output <dir>     Extract from PBF file
  poi-extractor --bbox <south,west,north,east> --output <dir>   Extract from Overpass API

OPTIONS:
  -i, --input <file>       Input OSM PBF file path
  -o, --output <dir>       Output directory for GeoJSON files (required)
  -b, --bbox <bbox>        Bounding box: south,west,north,east (for Overpass API)
  -c, --categories <file>  Custom categories JSON file
  --only <categories>      Only extract specific categories (comma-separated)
  --endpoint <url>         Custom Overpass API endpoint
  -v, --verbose            Enable verbose output
  -h, --help               Show this help message
  --version                Show version number

EXAMPLES:
  # Extract from a PBF file
  poi-extractor -i city.osm.pbf -o ./output

  # Extract from Overpass API using bbox
  poi-extractor --bbox -17.45,-66.25,-17.30,-66.10 -o ./output

  # Extract only specific categories
  poi-extractor -i city.osm.pbf -o ./output --only healthcare,education

  # Use custom categories
  poi-extractor -i city.osm.pbf -o ./output -c my-categories.json

  # Verbose output
  poi-extractor -i city.osm.pbf -o ./output -v

CATEGORIES:
  Default categories: healthcare, education, transport, food, shopping,
  tourism, finance, emergency, recreation, religion, government, accommodation

  Create a custom categories JSON file to add or modify categories.
  See the documentation for the categories file format.

MORE INFO:
  https://github.com/trufi-association/trufi-server-poi_extractor
`;
function parseArguments() {
    try {
        const { values } = parseArgs({
            options: {
                input: { type: 'string', short: 'i' },
                output: { type: 'string', short: 'o' },
                bbox: { type: 'string', short: 'b' },
                categories: { type: 'string', short: 'c' },
                only: { type: 'string' },
                endpoint: { type: 'string' },
                verbose: { type: 'boolean', short: 'v', default: false },
                help: { type: 'boolean', short: 'h', default: false },
                version: { type: 'boolean', default: false },
            },
            strict: true,
        });
        return values;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
        }
        console.error('Use --help for usage information');
        process.exit(1);
    }
}
function filterCategories(categories, only) {
    const selected = only.split(',').map(s => s.trim().toLowerCase());
    const filtered = {};
    for (const name of selected) {
        if (categories[name]) {
            filtered[name] = categories[name];
        }
        else {
            console.warn(`Warning: Unknown category "${name}", skipping`);
        }
    }
    if (Object.keys(filtered).length === 0) {
        console.error('Error: No valid categories selected');
        process.exit(1);
    }
    return filtered;
}
async function main() {
    const options = parseArguments();
    if (options.help) {
        console.log(HELP);
        process.exit(0);
    }
    if (options.version) {
        console.log(`trufi-server-poi_extractor v${VERSION}`);
        process.exit(0);
    }
    // Validate required options
    if (!options.output) {
        console.error('Error: Output directory is required (-o, --output)');
        console.error('Use --help for usage information');
        process.exit(1);
    }
    if (!options.input && !options.bbox) {
        console.error('Error: Either --input (PBF file) or --bbox (for Overpass API) is required');
        console.error('Use --help for usage information');
        process.exit(1);
    }
    if (options.input && options.bbox) {
        console.error('Error: Cannot use both --input and --bbox. Choose one source.');
        process.exit(1);
    }
    // Load categories
    let categories = options.categories
        ? loadCategories(options.categories)
        : DEFAULT_CATEGORIES;
    // Filter categories if --only is specified
    if (options.only) {
        categories = filterCategories(categories, options.only);
    }
    try {
        if (options.input) {
            // PBF extraction
            const inputPath = path.isAbsolute(options.input)
                ? options.input
                : path.resolve(process.cwd(), options.input);
            const outputPath = path.isAbsolute(options.output)
                ? options.output
                : path.resolve(process.cwd(), options.output);
            await extractFromPBF({
                inputFile: inputPath,
                outputDir: outputPath,
                categories,
                verbose: options.verbose,
            });
        }
        else if (options.bbox) {
            // Overpass extraction
            const bbox = parseBbox(options.bbox);
            const outputPath = path.isAbsolute(options.output)
                ? options.output
                : path.resolve(process.cwd(), options.output);
            await extractFromOverpass({
                bbox,
                outputDir: outputPath,
                categories,
                verbose: options.verbose,
                endpoint: options.endpoint,
            });
        }
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=cli.js.map