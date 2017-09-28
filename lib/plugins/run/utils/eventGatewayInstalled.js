'use strict';

const path = require('path');
const os = require('os');
const BbPromise = require('bluebird');
const { spawn } = BbPromise.promisifyAll(require('cross-spawn'));
const fileExistsSync = require('../../../utils/fs/fileExistsSync');

function eventGatewayInstalled(eventGatewayVersion) {
  const eventGatewayBinaryFilePath = path
    .join(os.homedir(), '.serverless', 'event-gateway', 'event-gateway');

  if (!fileExistsSync(eventGatewayBinaryFilePath)) {
    return false;
  }

  const cp = spawn.sync(eventGatewayBinaryFilePath, ['--version'],
    { encoding: 'utf8' });
  const currentVersion = cp.stdout.replace('Event Gateway version: ', '').trim();
  if (currentVersion !== eventGatewayVersion) {
    return false;
  }
  return true;
}

module.exports = eventGatewayInstalled;
