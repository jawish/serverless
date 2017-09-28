'use strict';

const BbPromise = require('bluebird');
const { spawn } = BbPromise.promisifyAll(require('cross-spawn'));

function installLocalEmulator(localEmulatorVersion) {
  spawn('npm', ['install', '-g', `@serverless/emulator@${localEmulatorVersion}`]);
}

module.exports = installLocalEmulator;
