/**
 * Example: Extract POIs from Overpass API
 *
 * This example demonstrates how to use the library to extract
 * POIs using the Overpass API with a bounding box for Cochabamba, Bolivia.
 *
 * Run with: npx tsx examples/cochabamba-overpass/extract.ts
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { extractFromOverpass, CATEGORIES } from '../../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Bounding box for Cochabamba, Bolivia
// Format: { south, west, north, east }
const COCHABAMBA_BBOX = {
  south: -17.45,
  west: -66.25,
  north: -17.30,
  east: -66.10,
};

async function main() {
  console.log('===========================================');
  console.log('Example: Extract POIs from Overpass API');
  console.log('Location: Cochabamba, Bolivia');
  console.log(`Bbox: ${COCHABAMBA_BBOX.south},${COCHABAMBA_BBOX.west},${COCHABAMBA_BBOX.north},${COCHABAMBA_BBOX.east}`);
  console.log('===========================================\n');

  const outputDir = path.join(__dirname, 'output');

  try {
    const result = await extractFromOverpass({
      bbox: COCHABAMBA_BBOX,
      outputDir,
      categories: CATEGORIES,
      verbose: true,
      iconFlavor: 'maki', // Options: 'maki', 'noto', 'material'
    });

    console.log('\n===========================================');
    console.log('Extraction Complete!');
    console.log('===========================================');
    console.log(`Total POIs extracted: ${result.metadata.total}`);
    console.log(`Output directory: ${outputDir}`);
    console.log('\nPOIs by category:');

    for (const category of result.metadata.categories) {
      console.log(`  - ${category.displayName}: ${category.count}`);
    }
  } catch (error) {
    console.error('Error during extraction:', error);
    process.exit(1);
  }
}

main();
