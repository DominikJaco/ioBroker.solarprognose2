const chai = require('chai');
const expect = chai.expect;

describe('Adapter Grundfunktionen', () => {
  it('sollte eine Zahl zurückgeben', () => {
    const result = 2 + 2;
    expect(result).to.equal(4);
  });

  it('should have correct package name', () => {
    const packageJson = require('../../package.json');
    expect(packageJson.name).to.equal('iobroker.solarprognose2');
  });

  it('sollte die Adapterkonfiguration laden', () => {
    const config = require('../../io-package.json');
    expect(config.common.name).to.equal('solarprognose2');
  });

  it('should have valid adapter configuration', () => {
    const ioPackage = require('../../io-package.json');
    expect(ioPackage.common).to.be.an('object');
    expect(ioPackage.common.name).to.equal('solarprognose2');
    expect(ioPackage.common.version).to.match(/^\d+\.\d+\.\d+$/);
  });
});