/* eslint-env mocha */

'use strict'

const series = require('async/series')

const IPFSRepo = require('../src')

describe('IPFS Repo Tests on the Browser', () => {
  const repo = new IPFSRepo('myrepo', {
    fs: require('datastore-level'),
    sharding: false,
    fsOptions: {
      db: require('level-js')
    },
    level: require('level-js')
  })

  before((done) => {
    series([
      (cb) => repo.init({Identity: {PrivKey: 'private'}}, cb),
      (cb) => repo.open(cb)
    ], done)
  })

  after((done) => {
    repo.close(done)
  })

  require('./repo-test')(repo)
  require('./blockstore-test')(repo)
})
