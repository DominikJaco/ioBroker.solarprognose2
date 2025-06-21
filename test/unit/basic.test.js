const chai = require('chai');
const expect = chai.expect;

describe('Adapter Grundfunktionen', () => {
  it('sollte eine Zahl zurückgeben', () => {
    const result = 2 + 2;
    expect(result).to.equal(4);
  });

  it('sollte die Adapterkonfiguration laden', () => {
    const config = require('../../io-package.json');
    expect(config.common.name).to.equal('solarprognose2');
  });
});