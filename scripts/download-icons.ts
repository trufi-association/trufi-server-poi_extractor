#!/usr/bin/env npx ts-node
/**
 * Download icons script
 *
 * Downloads SVG icons from various sources based on icons used in CATEGORIES.
 * Only downloads icons that are actually needed.
 *
 * Usage:
 *   npx tsx scripts/download-icons.ts [flavor|all]
 *
 * Examples:
 *   npx tsx scripts/download-icons.ts maki      # Download Maki icons used in CATEGORIES
 *   npx tsx scripts/download-icons.ts temaki    # Download Temaki icons used in CATEGORIES
 *   npx tsx scripts/download-icons.ts noto      # Download Noto color emoji icons
 *   npx tsx scripts/download-icons.ts all       # Download from all sources
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CATEGORIES } from '../src/categories.js';
import type { CategoriesConfig } from '../src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const ICONS_DIR = path.join(ROOT_DIR, 'icons');

/**
 * Extract all unique icon names from categories configuration
 */
function getIconsFromCategories(categories: CategoriesConfig): Set<string> {
  const icons = new Set<string>();

  for (const category of Object.values(categories)) {
    // Category with subcategories
    if ('subcategories' in category && category.subcategories) {
      for (const subcategory of category.subcategories) {
        icons.add(subcategory.icon);
      }
    }
    // Category with direct matchers (has icon)
    if ('icon' in category && category.icon) {
      icons.add(category.icon);
    }
  }

  return icons;
}

// Get icons needed from CATEGORIES
const REQUIRED_ICONS = getIconsFromCategories(CATEGORIES);

// Icon sources configuration
interface IconSource {
  name: string;
  listUrl?: string;
  getUrl: (iconName: string) => string;
  license: string;
  // For emoji-based sources that use unicode codepoints
  iconMapping?: Record<string, string>;
}

// Mapping from semantic names to Noto Emoji unicode codepoints
// These are colored emoji icons from Google's Noto Emoji project
const NOTO_ICON_MAPPING: Record<string, string> = {
  // Healthcare
  'hospital': '1f3e5',
  'clinic': '1f3e5',
  'doctor': '1fa7a',        // stethoscope
  'pharmacy': '1f48a',      // pill
  'dentist': '1f9b7',       // tooth
  'veterinary': '1f43e',    // paw prints

  // Education
  'school': '1f3eb',
  'university': '1f393',    // graduation cap
  'college': '1f393',
  'kindergarten': '1f476',  // baby
  'library': '1f4da',       // books

  // Transport
  'bus': '1f68c',
  'bus-station': '1f68f',   // bus stop
  'rail': '1f686',          // train
  'railway': '1f689',       // station
  'airport': '2708',        // airplane
  'taxi': '1f695',
  'car': '1f697',
  'ferry': '26f4',

  // Food & Drink
  'restaurant': '1f37d',    // fork and knife with plate
  'cafe': '2615',           // hot beverage
  'fast-food': '1f354',     // hamburger
  'bar': '1f37a',           // beer mug
  'pub': '1f37b',           // clinking beer mugs
  'ice-cream': '1f366',

  // Shopping
  'grocery': '1f6d2',       // shopping cart
  'supermarket': '1f6d2',
  'shop': '1f6cd',          // shopping bags
  'mall': '1f3ec',          // department store
  'bakery': '1f35e',        // bread
  'butcher': '1f969',       // cut of meat

  // Tourism
  'lodging': '1f3e8',       // hotel
  'hotel': '1f3e8',
  'museum': '1f3db',        // classical building
  'attraction': '1f3a1',    // ferris wheel
  'information': '2139',    // information
  'castle': '1f3f0',
  'monument': '1f5ff',      // moai

  // Finance
  'bank': '1f3e6',
  'atm': '1f3e7',

  // Emergency
  'police': '1f694',        // police car
  'fire-station': '1f692',  // fire engine
  'ambulance': '1f691',

  // Recreation
  'park': '1f333',          // deciduous tree
  'playground': '1f3a0',    // carousel horse
  'soccer': '26bd',         // soccer ball
  'sports': '1f3c3',        // person running
  'swimming': '1f3ca',      // swimmer
  'cinema': '1f3ac',        // clapper board
  'theatre': '1f3ad',       // performing arts

  // Religion
  'place-of-worship': '1f6d0', // place of worship
  'church': '26ea',
  'mosque': '1f54c',
  'synagogue': '1f54d',
  'temple': '1f6d5',        // hindu temple

  // Government
  'town-hall': '1f3db',     // classical building
  'embassy': '1f3e2',       // office building
  'post': '1f4ee',          // postbox
  'courthouse': '1f3db',

  // Other
  'parking': '1f17f',
  'toilet': '1f6bd',
  'fuel': '26fd',           // fuel pump
  'camping': '26fa',        // tent
  'viewpoint': '1f52d',     // telescope
};

// Mapping from semantic names to Material Design icon names
// These are monochrome icons from Google's Material Design Icons
const MATERIAL_ICON_MAPPING: Record<string, string> = {
  // Healthcare
  'hospital': 'local_hospital',
  'doctor': 'medical_services',
  'pharmacy': 'local_pharmacy',
  'dentist': 'medical_services',
  'veterinary': 'pets',

  // Education
  'school': 'school',
  'college': 'school',
  'library': 'local_library',

  // Transport
  'bus': 'directions_bus',
  'rail': 'train',
  'airport': 'local_airport',
  'car': 'directions_car',
  'ferry': 'directions_boat',

  // Food & Drink
  'restaurant': 'restaurant',
  'cafe': 'local_cafe',
  'fast-food': 'fastfood',
  'bar': 'local_bar',
  'ice-cream': 'icecream',

  // Shopping
  'grocery': 'shopping_cart',
  'shop': 'store',
  'bakery': 'bakery_dining',

  // Tourism
  'lodging': 'hotel',
  'museum': 'museum',
  'attraction': 'attractions',
  'information': 'info',
  'castle': 'castle',

  // Finance
  'bank': 'account_balance',
  'police': 'local_police',
  'fire-station': 'local_fire_department',

  // Recreation
  'park': 'park',
  'playground': 'attractions',
  'soccer': 'sports_soccer',
  'cinema': 'movie',

  // Religion
  'place-of-worship': 'church',
  'church': 'church',
  'mosque': 'mosque',
  'synagogue': 'synagogue',

  // Government
  'town-hall': 'account_balance',
  'embassy': 'domain',
  'post': 'local_post_office',
};

const ICON_SOURCES: Record<string, IconSource> = {
  maki: {
    name: 'Maki Icons (Mapbox)',
    listUrl: 'https://api.github.com/repos/mapbox/maki/contents/icons-meta',
    getUrl: (iconName: string) => `https://raw.githubusercontent.com/mapbox/maki/main/icons-meta/${iconName}.svg`,
    license: 'CC0 1.0 Universal (Public Domain)'
  },
  noto: {
    name: 'Noto Color Emoji (Google)',
    getUrl: (codepoint: string) => `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg/emoji_u${codepoint}.svg`,
    license: 'Apache License 2.0',
    iconMapping: NOTO_ICON_MAPPING
  },
  material: {
    name: 'Material Design Icons (Google)',
    getUrl: (iconName: string) => `https://raw.githubusercontent.com/marella/material-design-icons/main/svg/filled/${iconName}.svg`,
    license: 'Apache License 2.0',
    iconMapping: MATERIAL_ICON_MAPPING
  }
};

async function downloadIcon(url: string, outputPath: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return false;
    }
    const svg = await response.text();
    fs.writeFileSync(outputPath, svg);
    return true;
  } catch {
    return false;
  }
}

async function downloadFlavor(flavor: string): Promise<void> {
  const source = ICON_SOURCES[flavor];
  if (!source) {
    console.error(`Unknown icon flavor: ${flavor}`);
    console.log(`Available flavors: ${Object.keys(ICON_SOURCES).join(', ')}`);
    process.exit(1);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Downloading from ${source.name}`);
  console.log(`License: ${source.license}`);
  console.log(`${'='.repeat(60)}\n`);

  const outputDir = path.join(ICONS_DIR, flavor);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Filter to only icons used in CATEGORIES
  const iconsToDownload = Array.from(REQUIRED_ICONS);

  let iconToUrl: (name: string) => { url: string; outputName: string };

  // Handle emoji-based sources with icon mapping
  if (source.iconMapping) {
    // For noto, filter mapping to only required icons
    const filteredIcons = iconsToDownload.filter(name => source.iconMapping![name]);
    iconToUrl = (name: string) => ({
      url: source.getUrl(source.iconMapping![name]),
      outputName: name
    });
    console.log(`Downloading ${filteredIcons.length} icons from CATEGORIES\n`);

    // Use filtered icons for noto
    await downloadIcons(filteredIcons, iconToUrl, outputDir, source);
  } else {
    // For maki/temaki, download only required icons
    iconToUrl = (name: string) => ({
      url: source.getUrl(name),
      outputName: name
    });
    console.log(`Downloading ${iconsToDownload.length} icons from CATEGORIES\n`);

    await downloadIcons(iconsToDownload, iconToUrl, outputDir, source);
  }
}

async function downloadIcons(
  icons: string[],
  iconToUrl: (name: string) => { url: string; outputName: string },
  outputDir: string,
  source: IconSource
): Promise<void> {
  let downloaded = 0;
  let failed = 0;
  const failedIcons: string[] = [];

  // Download in batches for better performance
  const batchSize = 10;
  for (let i = 0; i < icons.length; i += batchSize) {
    const batch = icons.slice(i, i + batchSize);
    const promises = batch.map(async (iconName) => {
      const { url, outputName } = iconToUrl(iconName);
      const outputPath = path.join(outputDir, `${outputName}.svg`);
      const success = await downloadIcon(url, outputPath);
      return { iconName: outputName, success };
    });

    const results = await Promise.all(promises);
    for (const { iconName, success } of results) {
      if (success) {
        downloaded++;
      } else {
        failed++;
        failedIcons.push(iconName);
      }
    }

    // Progress
    process.stdout.write(`\r  Progress: ${downloaded + failed}/${icons.length} (${downloaded} OK, ${failed} failed)`);
  }

  console.log('\n');

  if (failedIcons.length > 0) {
    console.log(`Failed icons: ${failedIcons.join(', ')}`);
    console.log('(These icons may not exist in this flavor - try another flavor)\n');
  }

  console.log(`Done! Downloaded: ${downloaded}, Failed: ${failed}`);

  // Write metadata file
  const metadataPath = path.join(outputDir, 'metadata.json');
  const metadata = {
    source: source.name,
    license: source.license,
    downloadedAt: new Date().toISOString(),
    totalIcons: downloaded,
    icons: icons.filter(name => fs.existsSync(path.join(outputDir, `${name}.svg`)))
  };
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
}

async function main() {
  const arg = process.argv[2] || 'all';

  console.log(`Icons required from CATEGORIES: ${REQUIRED_ICONS.size}`);
  console.log(`  ${Array.from(REQUIRED_ICONS).join(', ')}\n`);

  if (arg === 'all') {
    console.log('Downloading icons from all sources...');
    for (const flavor of Object.keys(ICON_SOURCES)) {
      await downloadFlavor(flavor);
    }
    console.log('\n\nAll downloads complete!');
    console.log(`Icons saved to: ${ICONS_DIR}`);
  } else if (arg === 'list') {
    console.log('Available icon flavors:');
    for (const [key, source] of Object.entries(ICON_SOURCES)) {
      console.log(`  ${key}: ${source.name} (${source.license})`);
    }
  } else {
    await downloadFlavor(arg);
  }
}

main().catch(console.error);
