# Example: Extract POIs from PBF File

This example extracts POIs from a local `.osm.pbf` file for Cochabamba, Bolivia.

## When to Use This Method

- You have a local PBF file
- Processing large areas (faster than Overpass API)
- Working offline
- Need to process the same data multiple times

## Run the Example

```bash
# From the repository root
npx tsx examples/cochabamba-pbf/extract.ts
```

## The Code

```typescript
import { extractFromPBF, DEFAULT_CATEGORIES } from '../../src/index.js';

const result = await extractFromPBF({
  inputFile: './base.osm.pbf',
  outputDir: './output',
  categories: DEFAULT_CATEGORIES,
  verbose: true,
});

console.log(`Total POIs: ${result.metadata.total}`);
```

## Output

```
output/
├── healthcare.geojson
├── education.geojson
├── transport.geojson
├── food.geojson
├── shopping.geojson
├── tourism.geojson
├── finance.geojson
├── emergency.geojson
├── recreation.geojson
├── religion.geojson
├── government.geojson
├── accommodation.geojson
└── metadata.json
```

## VS Code

Use the **"Run Example: PBF"** launch configuration to run this example with debugging.
