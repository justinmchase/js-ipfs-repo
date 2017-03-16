/* eslint-env mocha */

'use strict'

const ncp = require('ncp').ncp
const rimraf = require('rimraf')
const path = require('path')
const series = require('async/series')
const os = require('os')
const expect = require('chai').expect

const IPFSRepo = require('../src')

describe('IPFS Repo Tests on on Node.js', () => {
  const testRepoPath = path.join(__dirname, 'test-repo')
  const date = Date.now().toString()
  const repoPath = testRepoPath + '-for-' + date
  const repoOpts = {
    fs: require('datastore-fs'),
    level: require('leveldown')
  }

  const repo = new IPFSRepo(repoPath, repoOpts)

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

  it('init', (done) => {
    const r = new IPFSRepo(os.tmpdir() + Math.random(), repoOpts)

    series([
      (cb) => r.init({hello: 'world'}, cb),
      (cb) => r.open(cb),
      (cb) => r.config.get((err, val) => {
        expect(err).to.not.exist
        expect(val).to.be.eql({hello: 'world'})
        cb()
      }),
      (cb) => r.close(cb)
    ], done)
  })

  require('./repo-test')(repo)
  require('./blockstore-test')(repo)
  require('./interop-test')(repo)
})
