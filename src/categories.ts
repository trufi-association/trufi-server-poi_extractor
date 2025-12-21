/**
 * OSM POI Extractor - Default Categories Configuration
 *
 * This file is part of trufi-server-poi_extractor.
 * Copyright (C) 2024 Trufi Association
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import type { CategoriesConfig } from './types.js';

export const DEFAULT_CATEGORIES: CategoriesConfig = {
  healthcare: {
    displayName: 'Healthcare',
    matchers: [
      { key: 'amenity', values: ['hospital', 'clinic', 'doctors', 'dentist', 'pharmacy', 'veterinary'] },
      { key: 'healthcare', values: null }
    ]
  },
  education: {
    displayName: 'Education',
    matchers: [
      { key: 'amenity', values: ['school', 'university', 'college', 'kindergarten', 'library'] }
    ]
  },
  transport: {
    displayName: 'Transport',
    matchers: [
      { key: 'amenity', values: ['bus_station', 'taxi', 'ferry_terminal', 'car_rental'] },
      { key: 'public_transport', values: ['station', 'stop_position', 'platform'] },
      { key: 'highway', values: ['bus_stop'] },
      { key: 'railway', values: ['station', 'halt', 'tram_stop'] },
      { key: 'aeroway', values: ['aerodrome', 'terminal'] }
    ]
  },
  food: {
    displayName: 'Food & Drink',
    matchers: [
      { key: 'amenity', values: ['restaurant', 'cafe', 'fast_food', 'bar', 'pub', 'food_court', 'ice_cream'] }
    ]
  },
  shopping: {
    displayName: 'Shopping',
    matchers: [
      { key: 'shop', values: ['supermarket', 'mall', 'department_store', 'convenience', 'bakery', 'butcher', 'greengrocer'] },
      { key: 'amenity', values: ['marketplace'] }
    ]
  },
  tourism: {
    displayName: 'Tourism',
    matchers: [
      { key: 'tourism', values: ['hotel', 'motel', 'guest_house', 'hostel', 'museum', 'attraction', 'viewpoint', 'information', 'artwork', 'gallery'] },
      { key: 'historic', values: ['monument', 'memorial', 'castle', 'archaeological_site', 'ruins'] }
    ]
  },
  finance: {
    displayName: 'Finance',
    matchers: [
      { key: 'amenity', values: ['bank', 'atm', 'bureau_de_change', 'money_transfer'] }
    ]
  },
  emergency: {
    displayName: 'Emergency',
    matchers: [
      { key: 'amenity', values: ['police', 'fire_station'] },
      { key: 'emergency', values: ['ambulance_station', 'emergency_ward_entrance'] }
    ]
  },
  recreation: {
    displayName: 'Recreation',
    matchers: [
      { key: 'leisure', values: ['park', 'playground', 'sports_centre', 'stadium', 'swimming_pool', 'fitness_centre', 'garden', 'nature_reserve'] },
      { key: 'amenity', values: ['cinema', 'theatre', 'nightclub', 'community_centre'] }
    ]
  },
  religion: {
    displayName: 'Religion',
    matchers: [
      { key: 'amenity', values: ['place_of_worship'] },
      { key: 'building', values: ['church', 'mosque', 'synagogue', 'temple'] }
    ]
  },
  government: {
    displayName: 'Government & Public Services',
    matchers: [
      { key: 'amenity', values: ['townhall', 'courthouse', 'embassy', 'post_office', 'community_centre'] },
      { key: 'office', values: ['government', 'administrative'] }
    ]
  },
  accommodation: {
    displayName: 'Accommodation',
    matchers: [
      { key: 'tourism', values: ['hotel', 'motel', 'hostel', 'guest_house', 'apartment', 'camp_site', 'caravan_site'] }
    ]
  }
};

export function loadCategories(customPath?: string): CategoriesConfig {
  if (customPath) {
    try {
      const fs = require('fs');
      const content = fs.readFileSync(customPath, 'utf-8');
      return JSON.parse(content) as CategoriesConfig;
    } catch {
      console.warn(`Warning: Could not load custom categories from ${customPath}, using defaults`);
    }
  }
  return DEFAULT_CATEGORIES;
}
