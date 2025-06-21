const chai = require('chai');
const expect = chai.expect;
const proxyquire = require('proxyquire');
const sinon = require('sinon');

describe('Main Adapter Tests', () => {
  it('should initialize without errors', () => {
    const fakeAdapter = {
      on: sinon.stub(),
      config: {
        accessToken: 'test-token',
        inverterId: 12345
      }
    };
    
    const main = proxyquire('../../main', {
      '@iobroker/adapter-core': class {
        constructor() { return fakeAdapter; }
      }
    });
    
    expect(fakeAdapter.on.calledWith('ready')).to.be.true;
    expect(fakeAdapter.on.calledWith('unload')).to.be.true;
  });
});