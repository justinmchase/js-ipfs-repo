'use strict'

const debug = require('debug')
const setImmediate = require('async/setImmediate')

const log = debug('repo:lock')

const lockFile = 'repo.lock'

self.IPFS_LOCKS = self.IPFS_LOCKS || {}

/**
 * Lock the repo in the given dir.
 *
 * @param {string} dir
 * @param {function(Error, lock)} callback
 * @returns {void}
 */
exports.lock = (dir, callback) => {
  const file = dir + '/' + lockFile
  log('locking %s', file)
  self.IPFS_LOCKS[file] = true
  const closer = {
    close (cb) {
      if (self.IPFS_LOCKS && self.IPFS_LOCKS[file]) {
        delete self.IPFS_LOCKS[file]
      }
      setImmediate(cb)
    }
  }
  setImmediate(() => {
    callback(null, closer)
  })
}

/**
 * Check if the repo in the given directory is locked.
 *
 * @param {string} dir
 * @param {function(Error, bool)} callback
 * @returns {void}
 */
exports.locked = (dir, callback) => {
  const file = dir + '/' + lockFile
  log('checking lock: %s')

  const locked = self.IPFS_LOCKS && self.IPFS_LOCKS[file]
  setImmediate(() => {
    callback(null, locked)
  })
}
