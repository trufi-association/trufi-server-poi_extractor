/**
 * OSM POI Extractor - Utility Functions
 *
 * This file is part of trufi-server-poi_extractor.
 * Copyright (C) 2024 Trufi Association
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
/**
 * Check if OSM tags match matchers
 */
function matchesMatchers(tags, matchers) {
    for (const matcher of matchers) {
        if (tags[matcher.key]) {
            if (matcher.values === null || matcher.values.includes(tags[matcher.key])) {
                return true;
            }
        }
    }
    return false;
}
/**
 * Check if OSM tags match a category's matchers
 */
export function matchesCategory(tags, category) {
    if (category.matchers && category.matchers.length > 0) {
        return matchesMatchers(tags, category.matchers);
    }
    return false;
}
/**
 * Find which category and subcategory an element belongs to based on its tags
 * Returns: { category: string, subcategory?: string, icon: string, color: string } or null
 */
export function findCategory(tags, categories) {
    for (const [categoryName, category] of Object.entries(categories)) {
        // Check subcategories first if they exist
        if (category.subcategories && category.subcategories.length > 0) {
            for (const subcategory of category.subcategories) {
                if (matchesMatchers(tags, subcategory.matchers)) {
                    return {
                        category: categoryName,
                        subcategory: subcategory.name,
                        icon: subcategory.icon,
                        color: subcategory.color
                    };
                }
            }
        }
        // Check category-level matchers if no subcategory matched
        if (category.matchers && matchesMatchers(tags, category.matchers)) {
            return {
                category: categoryName,
                icon: category.icon || 'marker',
                color: category.color || '#757575'
            };
        }
    }
    return null;
}
/**
 * Create a GeoJSON Point feature from an OSM node
 */
export function createPointFeature(id, lat, lon, tags, category, osmType = 'node', subcategory) {
    return {
        type: 'Feature',
        id,
        geometry: {
            type: 'Point',
            coordinates: [lon, lat]
        },
        properties: {
            id,
            name: tags?.name || '',
            type: getMainTagValue(tags),
            category,
            subcategory,
            osmType,
            ...tags
        }
    };
}
/**
 * Create a GeoJSON Polygon feature from a list of nodes
 */
export function createPolygonFeature(nodes, tags, osmId, category, osmType = 'way', subcategory) {
    if (!nodes || nodes.length < 3)
        return null;
    const coordinates = nodes.map(n => [n.lon, n.lat]);
    // Close the polygon if not already closed
    const isClosed = coordinates.length > 0 &&
        coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
        coordinates[0][1] === coordinates[coordinates.length - 1][1];
    if (!isClosed && coordinates.length > 0) {
        coordinates.push([...coordinates[0]]);
    }
    return {
        type: 'Feature',
        id: osmId,
        geometry: {
            type: 'Polygon',
            coordinates: [coordinates]
        },
        properties: {
            id: osmId,
            name: tags?.name || '',
            type: getMainTagValue(tags),
            category,
            subcategory,
            osmType,
            ...tags
        }
    };
}
/**
 * Calculate the centroid of a polygon
 */
export function calculateCentroid(nodes) {
    if (!nodes || nodes.length === 0)
        return null;
    let lat = 0, lon = 0;
    for (const node of nodes) {
        lat += node.lat;
        lon += node.lon;
    }
    return {
        lat: lat / nodes.length,
        lon: lon / nodes.length
    };
}
/**
 * Merge connected ways into single polygons
 */
export function mergeConnectedWays(ways) {
    if (ways.length <= 1)
        return ways;
    const merged = [];
    const used = new Set();
    for (let i = 0; i < ways.length; i++) {
        if (used.has(i))
            continue;
        let currentWay = [...ways[i]];
        used.add(i);
        let foundConnection = true;
        while (foundConnection) {
            foundConnection = false;
            for (let j = 0; j < ways.length; j++) {
                if (used.has(j))
                    continue;
                const way = ways[j];
                const currentFirst = currentWay[0];
                const currentLast = currentWay[currentWay.length - 1];
                const wayFirst = way[0];
                const wayLast = way[way.length - 1];
                const sameNode = (n1, n2) => Math.abs(n1.lat - n2.lat) < 0.0000001 && Math.abs(n1.lon - n2.lon) < 0.0000001;
                if (sameNode(currentLast, wayFirst)) {
                    currentWay = currentWay.concat(way.slice(1));
                    used.add(j);
                    foundConnection = true;
                    break;
                }
                else if (sameNode(currentLast, wayLast)) {
                    currentWay = currentWay.concat(way.slice(0, -1).reverse());
                    used.add(j);
                    foundConnection = true;
                    break;
                }
                else if (sameNode(currentFirst, wayLast)) {
                    currentWay = way.concat(currentWay.slice(1));
                    used.add(j);
                    foundConnection = true;
                    break;
                }
                else if (sameNode(currentFirst, wayFirst)) {
                    currentWay = way.slice(1).reverse().concat(currentWay);
                    used.add(j);
                    foundConnection = true;
                    break;
                }
            }
        }
        merged.push(currentWay);
    }
    return merged;
}
/**
 * Create a MultiPolygon feature from multiple outer ways
 */
export function createMultiPolygonFeature(outerWays, tags, osmId, category, subcategory) {
    if (!outerWays || outerWays.length === 0)
        return null;
    const mergedWays = mergeConnectedWays(outerWays);
    const polygons = [];
    for (const nodes of mergedWays) {
        if (nodes.length < 3)
            continue;
        const coordinates = nodes.map(n => [n.lon, n.lat]);
        const isClosed = coordinates.length > 0 &&
            coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
            coordinates[0][1] === coordinates[coordinates.length - 1][1];
        if (!isClosed && coordinates.length > 0) {
            coordinates.push([...coordinates[0]]);
        }
        polygons.push(coordinates);
    }
    if (polygons.length === 0)
        return null;
    const geometry = polygons.length === 1
        ? { type: 'Polygon', coordinates: [polygons[0]] }
        : { type: 'MultiPolygon', coordinates: polygons.map(p => [p]) };
    return {
        type: 'Feature',
        id: osmId,
        geometry,
        properties: {
            id: osmId,
            name: tags?.name || '',
            type: getMainTagValue(tags),
            category,
            subcategory,
            osmType: 'relation',
            ...tags
        }
    };
}
/**
 * Get the main tag value for type classification
 */
export function getMainTagValue(tags) {
    if (!tags)
        return 'unknown';
    for (const key of MAIN_TAG_KEYS) {
        if (tags[key])
            return tags[key];
    }
    // No well-known classifying key: take the first tag that describes what
    // the feature *is*, never one that only annotates it (addresses, names,
    // contacts, sources...). `addr:city` used to win here for office=* and
    // craft=* nodes, whose address tags come first in the PBF.
    for (const key of Object.keys(tags)) {
        if (isAnnotationTag(key))
            continue;
        if (tags[key])
            return tags[key];
    }
    return 'unknown';
}
/** Keys whose value names the kind of place, most specific first. */
export const MAIN_TAG_KEYS = [
    'amenity', 'tourism', 'shop', 'leisure', 'healthcare', 'historic',
    'public_transport', 'office', 'craft', 'emergency', 'club', 'sport',
    // `industrial=*` refines `landuse=industrial` / `man_made=works`, so it
    // has to come before both.
    'industrial', 'man_made', 'landuse', 'natural', 'aeroway', 'railway',
    'highway', 'building',
];
/** Keys that annotate a feature: a bare key, or that key with a `:` suffix. */
const ANNOTATION_KEYS = [
    'brand', 'operator', 'source', 'website', 'url', 'email', 'phone', 'fax',
    'opening_hours', 'wikidata', 'wikipedia', 'wikimedia_commons', 'image',
    'description', 'note', 'fixme', 'ref', 'source_ref', 'check_date', 'survey:date',
    'noname', 'delivery_hours',
    'level', 'layer', 'ele', 'start_date', 'is_in', 'cuisine', 'capacity',
    'wheelchair', 'internet_access', 'smoking', 'toilets', 'air_conditioning',
    'drive_through', 'delivery', 'takeaway', 'outdoor_seating', 'colour',
    'type', 'access', 'area',
];
/** Namespaces whose every key annotates (`addr:street`, `contact:phone`...). */
const ANNOTATION_NAMESPACES = ['addr:', 'contact:', 'payment:', 'diet:'];
/** `name`, `name:en`, `alt_name`, `old_name:ar`, `name_1`... */
const NAME_FAMILY = /^(?:[a-z0-9_]+_)?name(?:_\d+)?(?::|$)/;
/** `_1`, `_2`: the suffix OSM gives to a second copy of a tag. */
const NUMBERED = /^_\d+$/;
/** Whether an OSM key annotates a feature instead of classifying it. */
export function isAnnotationTag(key) {
    if (NAME_FAMILY.test(key))
        return true;
    if (ANNOTATION_NAMESPACES.some(ns => key.startsWith(ns)))
        return true;
    // `phone_1`, `image_2`: a numbered copy of an annotation is still one.
    return ANNOTATION_KEYS.some(k => key === k || key.startsWith(k + ':') || (key.startsWith(k + '_') && NUMBERED.test(key.slice(k.length))));
}
/**
 * Parse a bounding box string (south,west,north,east)
 */
export function parseBbox(bboxString) {
    const parts = bboxString.split(',').map(s => parseFloat(s.trim()));
    if (parts.length !== 4 || parts.some(isNaN)) {
        throw new Error('Invalid bbox format. Expected: south,west,north,east');
    }
    const [south, west, north, east] = parts;
    if (south >= north) {
        throw new Error('Invalid bbox: south must be less than north');
    }
    if (west >= east) {
        throw new Error('Invalid bbox: west must be less than east');
    }
    return { south, west, north, east };
}
/**
 * Format a bounding box for display
 */
export function formatBbox(bbox) {
    return `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;
}
/**
 * Check if a point is within a bounding box
 */
export function isInBbox(lat, lon, bbox) {
    return lat >= bbox.south && lat <= bbox.north && lon >= bbox.west && lon <= bbox.east;
}
//# sourceMappingURL=utils.js.map