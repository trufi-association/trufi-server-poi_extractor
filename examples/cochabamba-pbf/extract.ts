/**
 * Example: Extract POIs from a PBF file
 *
 * This example demonstrates how to use the library to extract
 * POIs from a local .osm.pbf file for Cochabamba, Bolivia.
 *
 * Run with: npx tsx examples/cochabamba-pbf/extract.ts
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { extractFromPBF, CATEGORIES } from '../../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('===========================================');
  console.log('Example: Extract POIs from PBF File');
  console.log('Location: Cochabamba, Bolivia');
  console.log('===========================================\n');

  // Path to the PBF file (local to this example)
  const inputFile = path.join(__dirname, 'cochabamba.osm.pbf');
  const outputDir = path.join(__dirname, 'output');

  try {
    const result = await extractFromPBF({
      inputFile,
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
