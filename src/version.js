'use strict'

const Key = require('interface-datastore').Key
const assert = require('assert')

const versionKey = new Key('version')

module.exports = (repo) => {
  return {
    /**
     * Check if a version file exists.
     *
     * @param {function(Error, bool)} callback
     * @returns {void}
     */
    exists (callback) {
      repo.store.has(versionKey, callback)
    },
    /**
     * Get the current version.
     *
     * @param {function(Error, number)} callback
     * @returns {void}
     */
    get (callback) {
      repo.store.get(versionKey, (err, buf) => {
        if (err) {
          return callback(err)
        }
        callback(null, parseInt(buf.toString().trim(), 10))
      })
    },
    /**
     * Set the version of the repo, writing it to the underlying store.
     *
     * @param {number} version
     * @param {function(Error)} callback
     * @returns {void}
     */
    set (version, callback) {
      repo.store.put(versionKey, new Buffer(String(version)), callback)
    }
  }
}
