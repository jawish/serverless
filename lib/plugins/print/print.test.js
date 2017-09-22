'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const Serverless = require('../../Serverless');
const AwsProvider = require('../aws/provider/awsProvider');
const CLI = require('../../classes/CLI');
const YAML = require('js-yaml');


describe('Print', () => {
  let print;
  let serverless;
  let getServerlessConfigFileStub;

  beforeEach(() => {
    getServerlessConfigFileStub = sinon.stub();
    const printPlugin = proxyquire('./print.js', {
      '../../utils/getServerlessConfigFile': getServerlessConfigFileStub,
    });
    serverless = new Serverless();
    serverless.processedInput = {
      commands: [ 'print' ],
      options: { stage: undefined, region: undefined }
    }
    serverless.cli = new CLI(serverless);
    print = new printPlugin(serverless);
    print.serverless.cli = {
      consoleLog: sinon.spy(),
    };
  });

  afterEach(() => {
    //print.serverless.cli.consoleLog.restore();
    serverless.service.provider.variableSyntax = '\\${([ ~:a-zA-Z0-9._\'",\\-\\/\\(\\)]+?)}'
  });

  it('should print standard config', () => {
    const conf = {
      service: 'my-service',
      provider: {
        name: 'aws'
      }
    }
    getServerlessConfigFileStub.resolves(conf)

    return print.print().then(() => {
      const message = print.serverless.cli.consoleLog.args.join();

      expect(getServerlessConfigFileStub.calledOnce).to.equal(true);
      expect(print.serverless.cli.consoleLog.called).to.be.equal(true);
      expect(message).to.have.string(YAML.dump(conf));
    })
  });

  it('should resolve command line variables', () => {
    const conf = {
      service: 'my-service',
      provider: {
        name: 'aws',
        stage: '${opt:stage}'
      }
    }
    getServerlessConfigFileStub.resolves(conf)

    serverless.processedInput = {
      commands: [ 'print' ],
      options: { stage: 'dev', region: undefined }
    }

    const expected = {
      service: 'my-service',
      provider: {
        name: 'aws',
        stage: 'dev'
      }
    }

    return print.print().then(() => {
      const message = print.serverless.cli.consoleLog.args.join();

      expect(getServerlessConfigFileStub.calledOnce).to.equal(true);
      expect(print.serverless.cli.consoleLog.called).to.be.equal(true);
      expect(message).to.equal(YAML.dump(expected));
    })
  });

  it('should resolve using custom variable syntax', () => {
    const conf = {
      service: 'my-service',
      provider: {
        name: 'aws',
        stage: '${{opt:stage}}'
      }
    }
    serverless.service.provider.variableSyntax = "\\${{([ ~:a-zA-Z0-9._\\'\",\\-\\/\\(\\)]+?)}}";
    getServerlessConfigFileStub.resolves(conf);

    serverless.processedInput = {
      commands: [ 'print' ],
      options: { stage: 'dev', region: undefined }
    }

    const expected = {
      service: 'my-service',
      provider: {
        name: 'aws',
        stage: 'dev'
      }
    }

    return print.print().then(() => {
      const message = print.serverless.cli.consoleLog.args.join();

      expect(getServerlessConfigFileStub.calledOnce).to.equal(true);
      expect(print.serverless.cli.consoleLog.called).to.be.equal(true);
      expect(message).to.equal(YAML.dump(expected));
    })
  });

  it('should resolve custom variables', () => {
    const conf = {
      service: 'my-service',
      custom: { region: 'us-east-1' },
      provider: {
        name: 'aws',
        stage: '${opt:stage}',
        region: '${self:custom.region}' 
      }
    }
    getServerlessConfigFileStub.resolves(conf)

    serverless.processedInput = {
      commands: [ 'print' ],
      options: { stage: 'dev', region: undefined }
    }
    serverless.service.custom = { region: 'us-east-1' }

    const expected = {
      service: 'my-service',
      custom: {
        region: 'us-east-1',
      },
      provider: {
        name: 'aws',
        stage: 'dev',
        region: 'us-east-1'
      }
    }

    return print.print().then(() => {
      const message = print.serverless.cli.consoleLog.args.join();

      expect(getServerlessConfigFileStub.calledOnce).to.equal(true);
      expect(print.serverless.cli.consoleLog.called).to.be.equal(true);
      expect(message).to.equal(YAML.dump(expected));
    })
  });

});