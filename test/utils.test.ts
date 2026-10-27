import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getMainTagValue, isAnnotationTag } from '../src/utils';

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
