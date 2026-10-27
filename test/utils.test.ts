import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getMainTagValue, isAnnotationTag, MAIN_TAG_KEYS } from '../src/utils.js';

test('office=company node whose address tags come first is typed by its office value', () => {
  // OSM node 3287805010 (Sana'a): addr:city precedes office in the PBF tag order.
  const tags = {
    'addr:city': 'صنعاء',
    'addr:street': 'شارع الستين',
    name: 'شركة يمنتراك المحدودة',
    'name:en': 'YemenTrack LLC',
    office: 'company',
  };
  assert.equal(getMainTagValue(tags), 'company');
});

test('craft=* is a classifying key', () => {
  assert.equal(getMainTagValue({ 'addr:housenumber': '12', craft: 'tailor' }), 'tailor');
});

test('the priority keys still win over office/craft', () => {
  assert.equal(getMainTagValue({ office: 'company', amenity: 'bank' }), 'bank');
  assert.equal(getMainTagValue({ shop: 'bakery', craft: 'confectionery' }), 'bakery');
});

test('a feature with only annotation tags is unknown, not its city', () => {
  assert.equal(getMainTagValue({ 'addr:city': 'Cochabamba', name: 'Sin tipo', phone: '+591' }), 'unknown');
  assert.equal(getMainTagValue(undefined as unknown as Record<string, string>), 'unknown');
});

test('an unlisted classifying key is still picked over annotations', () => {
  assert.equal(getMainTagValue({ 'addr:city': 'X', website: 'https://x', military: 'barracks' }), 'barracks');
});

test('isAnnotationTag covers the namespaces that never classify', () => {
  for (const k of ['addr:city', 'name:en', 'contact:phone', 'source:date', 'opening_hours', 'wikidata', 'brand:wikidata', 'payment:cash']) {
    assert.equal(isAnnotationTag(k), true, k);
  }
  for (const k of ['amenity', 'office', 'craft', 'shop', 'military']) {
    assert.equal(isAnnotationTag(k), false, k);
  }
});

test('the classifying keys that do the work are present, and in the right order', () => {
  // office/craft before the generic keys, industrial before landuse/man_made.
  assert.equal(getMainTagValue({ building: 'yes', office: 'company' }), 'company');
  assert.equal(getMainTagValue({ landuse: 'industrial', craft: 'brickyard' }), 'brickyard');
  assert.equal(getMainTagValue({ 'addr:city': 'X', building: 'yes', craft: 'tailor' }), 'tailor');
  assert.equal(getMainTagValue({ landuse: 'industrial', industrial: 'sawmill' }), 'sawmill');
  assert.equal(getMainTagValue({ man_made: 'works', industrial: 'poultry_farm' }), 'poultry_farm');
  const at = (k: string) => MAIN_TAG_KEYS.indexOf(k);
  assert.ok(at('office') > -1 && at('craft') > -1 && at('industrial') > -1);
  assert.ok(at('office') < at('man_made') && at('industrial') < at('man_made') && at('man_made') < at('building'));
});

test('annotation keys match whole keys or namespaces, not loose prefixes', () => {
  for (const k of ['name_1', 'alt_name:en', 'old_name', 'name:ar', 'addr:city', 'contact:phone', 'source:date', 'ref:bag']) {
    assert.equal(isAnnotationTag(k), true, k);
  }
  for (const k of ['delivery_hours', 'electrified', 'electronics_repair', 'typewriter', 'levelcrossing']) {
    assert.equal(isAnnotationTag(k), false, k);
  }
});
