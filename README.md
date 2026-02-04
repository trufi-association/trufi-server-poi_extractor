# trufi-server-poi_extractor

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![npm version](https://img.shields.io/npm/v/trufi-server-poi_extractor)](https://www.npmjs.com/package/trufi-server-poi_extractor)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

Extract Points of Interest (POIs) from OpenStreetMap data and output GeoJSON files. Supports both local PBF files and Overpass API queries.

**Part of the [Trufi Association](https://www.trufi-association.org/) open-source ecosystem.**

## Features

- **Dual Source Support**: Extract POIs from local `.osm.pbf` files or query the Overpass API directly
- **GeoJSON Output**: Generate standard GeoJSON files for each POI category
- **SVG Icons Included**: Each POI includes an inline SVG icon from [Maki Icons](https://github.com/mapbox/maki)
- **Customizable Categories**: Use default categories or define your own via JSON configuration
- **CLI & Library**: Use as a command-line tool or import as a library in your Node.js projects
- **TypeScript**: Fully typed for excellent IDE support
- **Polygon Support**: Extracts POIs as points, polygons, or multipolygons based on OSM geometry

## Installation

### Global Installation (CLI)

```bash
npm install -g trufi-server-poi_extractor
```

### Local Installation (Library)

```bash
npm install trufi-server-poi_extractor
```

### From Source

```bash
git clone https://github.com/trufi-association/trufi-server-poi_extractor.git
cd trufi-server-poi_extractor
npm install
npm run build
```

## Quick Start

Both examples extract POIs from Cochabamba, Bolivia using different data sources.

### Example 1: Extract from a PBF File

Use this method when you have a local `.osm.pbf` file (faster for large areas, works offline).

```bash
# The repository includes base.osm.pbf (Cochabamba extract)
# Or download from Geofabrik: wget https://download.geofabrik.de/south-america/bolivia-latest.osm.pbf

# Extract all POIs from the PBF file
poi-extractor -i base.osm.pbf -o ./output -v
```

### Example 2: Extract from Overpass API

Use this method to query OSM data directly via the internet using a bounding box.

```bash
# Extract POIs for Cochabamba using Overpass API
# Bbox format: south,west,north,east
# Note: Use --bbox=... format for negative coordinates
poi-extractor --bbox="-17.45,-66.25,-17.30,-66.10" -o ./output -v
```

> **Tip**: Use [bboxfinder.com](http://bboxfinder.com) to get the bounding box coordinates for your area.

### Output Structure

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

## CLI Usage

```
USAGE:
  poi-extractor --input <file.osm.pbf> --output <dir>
  poi-extractor --bbox <south,west,north,east> --output <dir>

OPTIONS:
  -i, --input <file>       Input OSM PBF file path
  -o, --output <dir>       Output directory for GeoJSON files (required)
  -b, --bbox <bbox>        Bounding box: south,west,north,east (for Overpass API)
  -c, --categories <file>  Custom categories JSON file
  --only <categories>      Only extract specific categories (comma-separated)
  --endpoint <url>         Custom Overpass API endpoint
  -v, --verbose            Enable verbose output
  -h, --help               Show help message
  --version                Show version number
```

### Examples

```bash
# Extract all categories from PBF
poi-extractor -i city.osm.pbf -o ./output

# Extract only healthcare and education
poi-extractor -i city.osm.pbf -o ./output --only healthcare,education

# Use custom categories file
poi-extractor -i city.osm.pbf -o ./output -c my-categories.json

# Extract from Overpass API with verbose output
poi-extractor --bbox="-17.45,-66.25,-17.30,-66.10" -o ./output -v

# Use a different Overpass endpoint
poi-extractor --bbox="-17.45,-66.25,-17.30,-66.10" -o ./output --endpoint https://overpass.kumi.systems/api/interpreter
```

## Library Usage

```typescript
import { extractFromPBF, extractFromOverpass, DEFAULT_CATEGORIES } from 'trufi-server-poi_extractor';

// Extract from PBF file
const result = await extractFromPBF({
  inputFile: './city.osm.pbf',
  outputDir: './output',
  categories: DEFAULT_CATEGORIES,
  verbose: true
});

console.log(`Extracted ${result.metadata.total} POIs`);

// Extract from Overpass API
const overpassResult = await extractFromOverpass({
  bbox: {
    south: -17.45,
    west: -66.25,
    north: -17.30,
    east: -66.10
  },
  outputDir: './output',
  categories: DEFAULT_CATEGORIES,
  verbose: true
});
```

## Default Categories

| Category | Description | OSM Tags |
|----------|-------------|----------|
| `healthcare` | Hospitals, clinics, pharmacies | `amenity=hospital/clinic/pharmacy`, `healthcare=*` |
| `education` | Schools, universities, libraries | `amenity=school/university/library` |
| `transport` | Bus stops, train stations, airports | `public_transport=*`, `railway=station`, `aeroway=*` |
| `food` | Restaurants, cafes, bars | `amenity=restaurant/cafe/fast_food/bar` |
| `shopping` | Supermarkets, malls, markets | `shop=supermarket/mall`, `amenity=marketplace` |
| `tourism` | Hotels, museums, attractions | `tourism=*`, `historic=*` |
| `finance` | Banks, ATMs | `amenity=bank/atm` |
| `emergency` | Police, fire stations | `amenity=police/fire_station`, `emergency=*` |
| `recreation` | Parks, sports facilities | `leisure=park/sports_centre`, `amenity=cinema` |
| `religion` | Places of worship | `amenity=place_of_worship` |
| `government` | Town halls, post offices | `amenity=townhall/post_office`, `office=government` |
| `accommodation` | Hotels, hostels, camping | `tourism=hotel/hostel/camp_site` |

## Custom Categories

Create a JSON file with your custom categories:

```json
{
  "coffee_shops": {
    "displayName": "Coffee Shops",
    "matchers": [
      { "key": "amenity", "values": ["cafe"] },
      { "key": "cuisine", "values": ["coffee"] }
    ]
  },
  "ev_charging": {
    "displayName": "EV Charging Stations",
    "matchers": [
      { "key": "amenity", "values": ["charging_station"] }
    ]
  },
  "all_shops": {
    "displayName": "All Shops",
    "matchers": [
      { "key": "shop", "values": null }
    ]
  }
}
```

Use `"values": null` to match any value for a tag key.

Then use it:

```bash
poi-extractor -i city.osm.pbf -o ./output -c my-categories.json
```

## GeoJSON Output Format

Each category generates a GeoJSON FeatureCollection:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": 123456789,
      "geometry": {
        "type": "Point",
        "coordinates": [-66.15, -17.38]
      },
      "properties": {
        "id": 123456789,
        "name": "Hospital del Norte",
        "type": "hospital",
        "category": "healthcare",
        "subcategory": "hospital",
        "osmType": "node",
        "iconName": "hospital",
        "amenity": "hospital",
        "addr:street": "Av. América"
      }
    }
  ]
}
```

## SVG Icons

Icons are stored in `metadata.json` and referenced by `iconName` in each feature. This avoids duplicating SVG content across thousands of features.

**Feature property:**
```json
"iconName": "hospital"
```

**metadata.json:**
```json
{
  "icons": {
    "hospital": "<?xml version=\"1.0\"...><svg>...</svg>",
    "pharmacy": "<?xml version=\"1.0\"...><svg>...</svg>"
  }
}
```

Icons are automatically mapped based on the POI's `type` (OSM tag value). Common mappings:

| Type | Icon |
|------|------|
| hospital | hospital |
| pharmacy | pharmacy |
| school | school |
| university | college |
| library | library |
| restaurant | restaurant |
| cafe | cafe |
| hotel | lodging |
| bank | bank |
| police | police |
| park | park |

Icons are sourced from [Maki Icons](https://github.com/mapbox/maki), released under [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) (Public Domain).

## Getting OSM Data

### PBF Files

- **Geofabrik**: https://download.geofabrik.de/ (continent/country extracts)
- **BBBike**: https://extract.bbbike.org/ (custom extracts)
- **Planet OSM**: https://planet.openstreetmap.org/ (full planet file)

### Overpass API

The tool uses the public Overpass API by default. For heavy usage, consider:
- Running your own Overpass instance
- Using alternative endpoints like `https://overpass.kumi.systems/api/interpreter`

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev -- -i test.osm.pbf -o ./out -v

# Type check
npm run typecheck

# Build for production
npm run build

# Run built version
npm start -- -i test.osm.pbf -o ./out -v
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Related Projects

- [Trufi Core](https://github.com/trufi-association/trufi-core) - Mobile transit app
- [Trufi Server](https://github.com/trufi-association/trufi-server) - Backend services
- [OpenTripPlanner](https://www.opentripplanner.org/) - Multimodal trip planning

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [OpenStreetMap](https://www.openstreetmap.org/) contributors for the amazing map data
- [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) for the query service
- [osm-pbf-parser](https://github.com/substack/osm-pbf-parser) for PBF parsing
- [Maki Icons](https://github.com/mapbox/maki) by Mapbox for POI icons (CC0 1.0)

---

Made with care by [Trufi Association](https://www.trufi-association.org/)
