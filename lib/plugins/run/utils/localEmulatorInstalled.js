'use strict';

const BbPromise = require('bluebird');
const { spawn } = BbPromise.promisifyAll(require('cross-spawn'));

function localEmulatorInstalled(localEmulatorVersion) {
  try {
    const cp = spawn.sync('sle', ['ping'], { encoding: 'utf8' });
    const currentVersion = cp.stdout.trim();
    if (currentVersion === 'pong' || (currentVersion !== localEmulatorVersion)) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = localEmulatorInstalled;
