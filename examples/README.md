# Examples

This directory contains TypeScript examples demonstrating how to use the trufi-server-poi_extractor library.

## Available Examples

### [cochabamba-pbf](./cochabamba-pbf/)

Extract POIs from a local `.osm.pbf` file using the library.

```bash
npx tsx examples/cochabamba-pbf/extract.ts
```

### [cochabamba-overpass](./cochabamba-overpass/)

Extract POIs from the Overpass API using a bounding box.

```bash
npx tsx examples/cochabamba-overpass/extract.ts
```

## Running from VS Code

1. Open the project in VS Code
2. Go to **Run and Debug** (Ctrl+Shift+D / Cmd+Shift+D)
3. Select a configuration:
   - **Run Example: PBF** - Runs `examples/cochabamba-pbf/extract.ts`
   - **Run Example: Overpass** - Runs `examples/cochabamba-overpass/extract.ts`
4. Press **F5** to run

## Example Code

### PBF Extraction

```typescript
import { extractFromPBF, DEFAULT_CATEGORIES } from 'trufi-server-poi_extractor';

const result = await extractFromPBF({
  inputFile: './cochabamba.osm.pbf',
  outputDir: './output',
  categories: DEFAULT_CATEGORIES,
  verbose: true,
});

console.log(`Extracted ${result.metadata.total} POIs`);
```

### Overpass API Extraction

```typescript
import { extractFromOverpass, DEFAULT_CATEGORIES } from 'trufi-server-poi_extractor';

const result = await extractFromOverpass({
  bbox: {
    south: -17.45,
    west: -66.25,
    north: -17.30,
    east: -66.10,
  },
  outputDir: './output',
  categories: DEFAULT_CATEGORIES,
  verbose: true,
});

console.log(`Extracted ${result.metadata.total} POIs`);
```

## Output

Each example generates GeoJSON files in its `output/` directory:

```
output/
├── healthcare.geojson
├── education.geojson
├── transport.geojson
├── ...
└── metadata.json
```
