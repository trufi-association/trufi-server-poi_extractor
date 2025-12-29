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
export const DEFAULT_CATEGORIES = {
    healthcare: {
        displayName: 'Healthcare',
        subcategories: [
            {
                name: 'hospital',
                displayName: 'Hospitals',
                matchers: [
                    { key: 'amenity', values: ['hospital'] }
                ]
            },
            {
                name: 'clinic',
                displayName: 'Clinics & Doctors',
                matchers: [
                    { key: 'amenity', values: ['clinic', 'doctors'] }
                ]
            },
            {
                name: 'pharmacy',
                displayName: 'Pharmacies',
                matchers: [
                    { key: 'amenity', values: ['pharmacy'] }
                ]
            },
            {
                name: 'dentist',
                displayName: 'Dentists',
                matchers: [
                    { key: 'amenity', values: ['dentist'] }
                ]
            },
            {
                name: 'veterinary',
                displayName: 'Veterinary',
                matchers: [
                    { key: 'amenity', values: ['veterinary'] }
                ]
            },
            {
                name: 'other',
                displayName: 'Other Healthcare',
                matchers: [
                    { key: 'healthcare', values: null }
                ]
            }
        ]
    },
    education: {
        displayName: 'Education',
        subcategories: [
            {
                name: 'school',
                displayName: 'Schools',
                matchers: [
                    { key: 'amenity', values: ['school'] }
                ]
            },
            {
                name: 'university',
                displayName: 'Universities & Colleges',
                matchers: [
                    { key: 'amenity', values: ['university', 'college'] }
                ]
            },
            {
                name: 'kindergarten',
                displayName: 'Kindergartens',
                matchers: [
                    { key: 'amenity', values: ['kindergarten'] }
                ]
            },
            {
                name: 'library',
                displayName: 'Libraries',
                matchers: [
                    { key: 'amenity', values: ['library'] }
                ]
            }
        ]
    },
    transport: {
        displayName: 'Transport',
        subcategories: [
            {
                name: 'public_transit',
                displayName: 'Public Transit',
                matchers: [
                    { key: 'amenity', values: ['bus_station'] },
                    { key: 'public_transport', values: ['station', 'stop_position', 'platform'] },
                    { key: 'highway', values: ['bus_stop'] }
                ]
            },
            {
                name: 'railway',
                displayName: 'Railway',
                matchers: [
                    { key: 'railway', values: ['station', 'halt', 'tram_stop'] }
                ]
            },
            {
                name: 'airport',
                displayName: 'Airport',
                matchers: [
                    { key: 'aeroway', values: ['aerodrome', 'terminal'] }
                ]
            },
            {
                name: 'taxi',
                displayName: 'Taxi & Car Rental',
                matchers: [
                    { key: 'amenity', values: ['taxi', 'car_rental'] }
                ]
            },
            {
                name: 'ferry',
                displayName: 'Ferry',
                matchers: [
                    { key: 'amenity', values: ['ferry_terminal'] }
                ]
            }
        ]
    },
    food: {
        displayName: 'Food & Drink',
        subcategories: [
            {
                name: 'restaurant',
                displayName: 'Restaurants',
                matchers: [
                    { key: 'amenity', values: ['restaurant'] }
                ]
            },
            {
                name: 'cafe',
                displayName: 'Cafes',
                matchers: [
                    { key: 'amenity', values: ['cafe'] }
                ]
            },
            {
                name: 'fast_food',
                displayName: 'Fast Food',
                matchers: [
                    { key: 'amenity', values: ['fast_food', 'food_court'] }
                ]
            },
            {
                name: 'bar',
                displayName: 'Bars & Pubs',
                matchers: [
                    { key: 'amenity', values: ['bar', 'pub'] }
                ]
            },
            {
                name: 'ice_cream',
                displayName: 'Ice Cream',
                matchers: [
                    { key: 'amenity', values: ['ice_cream'] }
                ]
            }
        ]
    },
    shopping: {
        displayName: 'Shopping',
        subcategories: [
            {
                name: 'supermarket',
                displayName: 'Supermarkets',
                matchers: [
                    { key: 'shop', values: ['supermarket', 'convenience'] }
                ]
            },
            {
                name: 'mall',
                displayName: 'Shopping Malls',
                matchers: [
                    { key: 'shop', values: ['mall', 'department_store'] }
                ]
            },
            {
                name: 'food_shop',
                displayName: 'Food Shops',
                matchers: [
                    { key: 'shop', values: ['bakery', 'butcher', 'greengrocer'] }
                ]
            },
            {
                name: 'marketplace',
                displayName: 'Marketplaces',
                matchers: [
                    { key: 'amenity', values: ['marketplace'] }
                ]
            }
        ]
    },
    tourism: {
        displayName: 'Tourism',
        subcategories: [
            {
                name: 'accommodation',
                displayName: 'Accommodation',
                matchers: [
                    { key: 'tourism', values: ['hotel', 'motel', 'guest_house', 'hostel'] }
                ]
            },
            {
                name: 'culture',
                displayName: 'Cultural Sites',
                matchers: [
                    { key: 'tourism', values: ['museum', 'gallery', 'artwork'] }
                ]
            },
            {
                name: 'attraction',
                displayName: 'Attractions',
                matchers: [
                    { key: 'tourism', values: ['attraction', 'viewpoint'] }
                ]
            },
            {
                name: 'information',
                displayName: 'Tourist Information',
                matchers: [
                    { key: 'tourism', values: ['information'] }
                ]
            },
            {
                name: 'historic',
                displayName: 'Historic Sites',
                matchers: [
                    { key: 'historic', values: ['monument', 'memorial', 'castle', 'archaeological_site', 'ruins'] }
                ]
            }
        ]
    },
    finance: {
        displayName: 'Finance',
        subcategories: [
            {
                name: 'bank',
                displayName: 'Banks',
                matchers: [
                    { key: 'amenity', values: ['bank'] }
                ]
            },
            {
                name: 'atm',
                displayName: 'ATMs',
                matchers: [
                    { key: 'amenity', values: ['atm'] }
                ]
            },
            {
                name: 'exchange',
                displayName: 'Currency Exchange',
                matchers: [
                    { key: 'amenity', values: ['bureau_de_change', 'money_transfer'] }
                ]
            }
        ]
    },
    emergency: {
        displayName: 'Emergency',
        subcategories: [
            {
                name: 'police',
                displayName: 'Police',
                matchers: [
                    { key: 'amenity', values: ['police'] }
                ]
            },
            {
                name: 'fire',
                displayName: 'Fire Station',
                matchers: [
                    { key: 'amenity', values: ['fire_station'] }
                ]
            },
            {
                name: 'ambulance',
                displayName: 'Ambulance',
                matchers: [
                    { key: 'emergency', values: ['ambulance_station', 'emergency_ward_entrance'] }
                ]
            }
        ]
    },
    recreation: {
        displayName: 'Recreation',
        subcategories: [
            {
                name: 'park',
                displayName: 'Parks & Gardens',
                matchers: [
                    { key: 'leisure', values: ['park', 'garden', 'nature_reserve'] }
                ]
            },
            {
                name: 'playground',
                displayName: 'Playgrounds',
                matchers: [
                    { key: 'leisure', values: ['playground'] }
                ]
            },
            {
                name: 'sports',
                displayName: 'Sports Facilities',
                matchers: [
                    { key: 'leisure', values: ['sports_centre', 'stadium', 'swimming_pool', 'fitness_centre'] }
                ]
            },
            {
                name: 'entertainment',
                displayName: 'Entertainment',
                matchers: [
                    { key: 'amenity', values: ['cinema', 'theatre', 'nightclub'] }
                ]
            },
            {
                name: 'community',
                displayName: 'Community Centers',
                matchers: [
                    { key: 'amenity', values: ['community_centre'] }
                ]
            }
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
        subcategories: [
            {
                name: 'administration',
                displayName: 'Government Offices',
                matchers: [
                    { key: 'amenity', values: ['townhall', 'courthouse'] },
                    { key: 'office', values: ['government', 'administrative'] }
                ]
            },
            {
                name: 'embassy',
                displayName: 'Embassies',
                matchers: [
                    { key: 'amenity', values: ['embassy'] }
                ]
            },
            {
                name: 'post',
                displayName: 'Post Offices',
                matchers: [
                    { key: 'amenity', values: ['post_office'] }
                ]
            }
        ]
    }
};
export function loadCategories(customPath) {
    if (customPath) {
        try {
            const fs = require('fs');
            const content = fs.readFileSync(customPath, 'utf-8');
            return JSON.parse(content);
        }
        catch {
            console.warn(`Warning: Could not load custom categories from ${customPath}, using defaults`);
        }
    }
    return DEFAULT_CATEGORIES;
}
//# sourceMappingURL=categories.js.map