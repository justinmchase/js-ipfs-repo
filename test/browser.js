/* eslint-env mocha */

'use strict'

const series = require('async/series')

const IPFSRepo = require('../src')

describe('IPFS Repo Tests on the Browser', () => {
  const repo = new IPFSRepo('myrepo', {
    fs: require('datastore-level'),
    fsOptions: {
      db: require('level-js')
    },
    level: require('level-js')
  })

  before((done) => {
    series([
      (cb) => repo.init(cb),
      (cb) => repo.open(cb)
    ], done)
  })

  require('./repo-test')(repo)
  require('./blockstore-test')(repo)
})
