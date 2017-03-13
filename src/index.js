'use strict'

const MountStore = require('datstore-core').MountDatastore
const Key = require('interface-datastore').Key
const LevelStore = require('datastore-level')
const assert = require('assert')

const version = require('./version')
const config = require('./config')
const blockstore = require('./blockstore')

/**
 * IpfsRepo implements all required functionality to read and write to an ipfs repo.
 *
 */
class IpfsRepo {
  /**
   * @param {string} repoPath - path where the repo is stored
   * @param {object} options
   */
  constructor (repoPath, options) {
    assert.equal(typeof repoPath, 'string', 'missing repoPath')
    assert(options, 'missing options')

    this.store = new MountStore([{
      prefix: new Key('/'),
      datstore: new options.fs(repoPath)
    },{
      prefix: new Key('/datastore'),
      datastore: new LevelStore(path.join(repoPath, 'datastore'), {db: options.level})
    }, {
      prefix: new Key('/blocks'),
      datastore: new options.fs(path.join(repoPath, 'blocks'))
    }])

    this.version = version(this)
    this.config = config(this)
    this.blockstore = blockstore(this)
  }

  /**
   * Check if a repo exists.
   *
   * @param {function(Error, bool)} callback
   * @returns {void}
   */
  exists (callback) {
    this.version.exists(callback)
  }
}

module.exports = IpfsRepo
