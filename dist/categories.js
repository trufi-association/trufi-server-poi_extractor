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
                icon: 'hospital',
                matchers: [
                    { key: 'amenity', values: ['hospital'] }
                ]
            },
            {
                name: 'clinic',
                displayName: 'Clinics & Doctors',
                icon: 'doctor',
                matchers: [
                    { key: 'amenity', values: ['clinic', 'doctors'] }
                ]
            },
            {
                name: 'pharmacy',
                displayName: 'Pharmacies',
                icon: 'pharmacy',
                matchers: [
                    { key: 'amenity', values: ['pharmacy'] }
                ]
            },
            {
                name: 'dentist',
                displayName: 'Dentists',
                icon: 'dentist',
                matchers: [
                    { key: 'amenity', values: ['dentist'] }
                ]
            },
            {
                name: 'veterinary',
                displayName: 'Veterinary',
                icon: 'veterinary',
                matchers: [
                    { key: 'amenity', values: ['veterinary'] }
                ]
            },
            {
                name: 'other',
                displayName: 'Other Healthcare',
                icon: 'hospital',
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
                icon: 'school',
                matchers: [
                    { key: 'amenity', values: ['school'] }
                ]
            },
            {
                name: 'university',
                displayName: 'Universities & Colleges',
                icon: 'college',
                matchers: [
                    { key: 'amenity', values: ['university', 'college'] }
                ]
            },
            {
                name: 'kindergarten',
                displayName: 'Kindergartens',
                icon: 'school',
                matchers: [
                    { key: 'amenity', values: ['kindergarten'] }
                ]
            },
            {
                name: 'library',
                displayName: 'Libraries',
                icon: 'library',
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
                icon: 'bus',
                matchers: [
                    { key: 'amenity', values: ['bus_station'] },
                    { key: 'public_transport', values: ['station', 'stop_position', 'platform'] },
                    { key: 'highway', values: ['bus_stop'] }
                ]
            },
            {
                name: 'railway',
                displayName: 'Railway',
                icon: 'rail',
                matchers: [
                    { key: 'railway', values: ['station', 'halt', 'tram_stop'] }
                ]
            },
            {
                name: 'airport',
                displayName: 'Airport',
                icon: 'airport',
                matchers: [
                    { key: 'aeroway', values: ['aerodrome', 'terminal'] }
                ]
            },
            {
                name: 'taxi',
                displayName: 'Taxi & Car Rental',
                icon: 'car',
                matchers: [
                    { key: 'amenity', values: ['taxi', 'car_rental'] }
                ]
            },
            {
                name: 'ferry',
                displayName: 'Ferry',
                icon: 'ferry',
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
                icon: 'restaurant',
                matchers: [
                    { key: 'amenity', values: ['restaurant'] }
                ]
            },
            {
                name: 'cafe',
                displayName: 'Cafes',
                icon: 'cafe',
                matchers: [
                    { key: 'amenity', values: ['cafe'] }
                ]
            },
            {
                name: 'fast_food',
                displayName: 'Fast Food',
                icon: 'fast-food',
                matchers: [
                    { key: 'amenity', values: ['fast_food', 'food_court'] }
                ]
            },
            {
                name: 'bar',
                displayName: 'Bars & Pubs',
                icon: 'bar',
                matchers: [
                    { key: 'amenity', values: ['bar', 'pub'] }
                ]
            },
            {
                name: 'ice_cream',
                displayName: 'Ice Cream',
                icon: 'ice-cream',
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
                icon: 'grocery',
                matchers: [
                    { key: 'shop', values: ['supermarket', 'convenience'] }
                ]
            },
            {
                name: 'mall',
                displayName: 'Shopping Malls',
                icon: 'shop',
                matchers: [
                    { key: 'shop', values: ['mall', 'department_store'] }
                ]
            },
            {
                name: 'food_shop',
                displayName: 'Food Shops',
                icon: 'bakery',
                matchers: [
                    { key: 'shop', values: ['bakery', 'butcher', 'greengrocer'] }
                ]
            },
            {
                name: 'marketplace',
                displayName: 'Marketplaces',
                icon: 'shop',
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
                icon: 'lodging',
                matchers: [
                    { key: 'tourism', values: ['hotel', 'motel', 'guest_house', 'hostel'] }
                ]
            },
            {
                name: 'culture',
                displayName: 'Cultural Sites',
                icon: 'museum',
                matchers: [
                    { key: 'tourism', values: ['museum', 'gallery', 'artwork'] }
                ]
            },
            {
                name: 'attraction',
                displayName: 'Attractions',
                icon: 'attraction',
                matchers: [
                    { key: 'tourism', values: ['attraction', 'viewpoint'] }
                ]
            },
            {
                name: 'information',
                displayName: 'Tourist Information',
                icon: 'information',
                matchers: [
                    { key: 'tourism', values: ['information'] }
                ]
            },
            {
                name: 'historic',
                displayName: 'Historic Sites',
                icon: 'castle',
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
                icon: 'bank',
                matchers: [
                    { key: 'amenity', values: ['bank'] }
                ]
            },
            {
                name: 'atm',
                displayName: 'ATMs',
                icon: 'bank',
                matchers: [
                    { key: 'amenity', values: ['atm'] }
                ]
            },
            {
                name: 'exchange',
                displayName: 'Currency Exchange',
                icon: 'bank',
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
                icon: 'police',
                matchers: [
                    { key: 'amenity', values: ['police'] }
                ]
            },
            {
                name: 'fire',
                displayName: 'Fire Station',
                icon: 'fire-station',
                matchers: [
                    { key: 'amenity', values: ['fire_station'] }
                ]
            },
            {
                name: 'ambulance',
                displayName: 'Ambulance',
                icon: 'hospital',
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
                icon: 'park',
                matchers: [
                    { key: 'leisure', values: ['park', 'garden', 'nature_reserve'] }
                ]
            },
            {
                name: 'playground',
                displayName: 'Playgrounds',
                icon: 'playground',
                matchers: [
                    { key: 'leisure', values: ['playground'] }
                ]
            },
            {
                name: 'sports',
                displayName: 'Sports Facilities',
                icon: 'soccer',
                matchers: [
                    { key: 'leisure', values: ['sports_centre', 'stadium', 'swimming_pool', 'fitness_centre'] }
                ]
            },
            {
                name: 'entertainment',
                displayName: 'Entertainment',
                icon: 'cinema',
                matchers: [
                    { key: 'amenity', values: ['cinema', 'theatre', 'nightclub'] }
                ]
            },
            {
                name: 'community',
                displayName: 'Community Centers',
                icon: 'town-hall',
                matchers: [
                    { key: 'amenity', values: ['community_centre'] }
                ]
            }
        ]
    },
    religion: {
        displayName: 'Religion',
        icon: 'place-of-worship',
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
                icon: 'town-hall',
                matchers: [
                    { key: 'amenity', values: ['townhall', 'courthouse'] },
                    { key: 'office', values: ['government', 'administrative'] }
                ]
            },
            {
                name: 'embassy',
                displayName: 'Embassies',
                icon: 'embassy',
                matchers: [
                    { key: 'amenity', values: ['embassy'] }
                ]
            },
            {
                name: 'post',
                displayName: 'Post Offices',
                icon: 'post',
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