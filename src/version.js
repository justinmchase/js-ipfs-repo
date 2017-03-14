'use strict'

const Key = require('interface-datastore').Key

const versionKey = new Key('version')
const repoVersion = 5

module.exports = (store) => {
  return {
    /**
     * Check if a version file exists.
     *
     * @param {function(Error, bool)} callback
     * @returns {void}
     */
    exists (callback) {
      store.has(versionKey, callback)
    },
    /**
     * Get the current version.
     *
     * @param {function(Error, number)} callback
     * @returns {void}
     */
    get (callback) {
      store.get(versionKey, (err, buf) => {
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
      store.put(versionKey, new Buffer(String(version)), callback)
    },
    /**
     * Check the current version, and return an error on missmatch
     * @param {function(Error)} callback
     * @returns {void}
     */
    check (callback) {
      this.get((err, version) => {
        if (err) {
          return callback(err)
        }
        if (version !== repoVersion) {
          return callback(new Error(`version mismatch: expected v${repoVersion}, found v${version}`))
        }
        callback()
      })
    }
  }
}
