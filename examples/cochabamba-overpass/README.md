# Example: Extract POIs from Overpass API

This example extracts POIs using the Overpass API for Cochabamba, Bolivia.

## When to Use This Method

- You don't have a local PBF file
- Need fresh/up-to-date OSM data
- Processing a small to medium area
- Quick one-time extraction

## Run the Example

```bash
# From the repository root
npx tsx examples/cochabamba-overpass/extract.ts
```

## The Code

```typescript
import { extractFromOverpass, DEFAULT_CATEGORIES } from '../../src/index.js';

// Bounding box for Cochabamba, Bolivia
const COCHABAMBA_BBOX = {
  south: -17.45,
  west: -66.25,
  north: -17.30,
  east: -66.10,
};

const result = await extractFromOverpass({
  bbox: COCHABAMBA_BBOX,
  outputDir: './output',
  categories: DEFAULT_CATEGORIES,
  verbose: true,
});

console.log(`Total POIs: ${result.metadata.total}`);
```

## Cochabamba Bounding Box

```
South: -17.45
West:  -66.25
North: -17.30
East:  -66.10
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

## Finding Your Own Bounding Box

- [bboxfinder.com](http://bboxfinder.com)
- [boundingbox.klokantech.com](https://boundingbox.klokantech.com/)

## VS Code

Use the **"Run Example: Overpass"** launch configuration to run this example with debugging.
