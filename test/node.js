/* eslint-env mocha */

'use strict'

const expect = require('chai').expect
const ncp = require('ncp').ncp
const rimraf = require('rimraf')
const path = require('path')

const IPFSRepo = require('../src')

describe('IPFS Repo Tests on on Node.js', () => {
  const testRepoPath = path.join(__dirname, 'test-repo')
  const date = Date.now().toString()
  const repoPath = testRepoPath + '-for-' + date

  let repo

  before((done) => {
    console.log('repoPath: %s', repoPath)
    repo = new IPFSRepo(repoPath, {
      fs: require('datastore-fs'),
      level: require('leveldown')
    })
    ncp(testRepoPath, repoPath, (err) => {
      expect(err).to.not.exist

      repo.open((err) => {
        expect(err).to.not.exist
        done()
      })
    })
  })

  after((done) => {
    rimraf(repoPath, (err) => {
      expect(err).to.not.exist
      done()
    })
  })
  require('./repo-test')(repo)
})
