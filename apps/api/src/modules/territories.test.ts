import { describe, expect, it } from 'vitest';
import { territoryLevel } from './territories.js';
describe('UBIGEO levels', () => {
  it('distinguishes department, province and district', () => {
    expect(territoryLevel('20')).toBe('departamento');
    expect(territoryLevel('2001')).toBe('provincia');
    expect(territoryLevel('200101')).toBe('distrito');
  });
});
