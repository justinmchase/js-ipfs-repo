/* eslint-env mocha */

'use strict'

const ncp = require('ncp').ncp
const rimraf = require('rimraf')
const path = require('path')
const series = require('async/series')

const IPFSRepo = require('../src')

describe('IPFS Repo Tests on on Node.js', () => {
  const testRepoPath = path.join(__dirname, 'test-repo')
  const date = Date.now().toString()
  const repoPath = testRepoPath + '-for-' + date

  const repo = new IPFSRepo(repoPath, {
    fs: require('datastore-fs'),
    level: require('leveldown')
  })

  before((done) => {
    series([
      (cb) => ncp(testRepoPath, repoPath, cb),
      (cb) => repo.open(cb)
    ], done)
  })

  after((done) => {
    series([
      (cb) => repo.close(cb),
      (cb) => rimraf(repoPath, cb)
    ], done)
  })

  require('./repo-test')(repo)
})
