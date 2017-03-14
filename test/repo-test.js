/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const series = require('async/series')

const Repo = require('../src/index')

module.exports = (repo) => {
  describe('IPFS Repo Tests', () => {
    describe('init', () => {
      it('bad repo init 1', () => {
        expect(
          () => new Repo()
        ).to.throw(Error)
      })
    })

    it('check if Repo exists', (done) => {
      repo.exists((err, exists) => {
        expect(err).to.not.exist
        expect(exists).to.equal(true)
        done()
      })
    })

    it('exposes the path', () => {
      expect(repo.path).to.be.a('string')
    })

    it('getPrivateKey', (done) => {
      repo.getPrivateKey((err, privKey) => {
        expect(err).to.not.exist
        expect(privKey).to.be.a('string')
        done()
      })
    })

    describe('config', () => {
      it('get config', (done) => {
        repo.config.get((err, config) => {
          expect(err).to.not.exist
          expect(config).to.be.a('object')
          done()
        })
      })

      it('set config', (done) => {
        series([
          (cb) => repo.config.set({a: 'b'}, cb),
          (cb) => repo.config.get((err, config) => {
            if (err) return cb(err)
            expect(config).to.deep.equal({a: 'b'})
            cb()
          })
        ], done)
      })
    })

    describe('version', () => {
      it('get version', (done) => {
        repo.version.get((err, version) => {
          expect(err).to.not.exist
          expect(version).to.be.a('string')
          expect(Number(version)).to.be.a('number')
          done()
        })
      })

      it('set version', (done) => {
        repo.version.set('9000', (err) => {
          expect(err).to.not.exist
          repo.version.get((err, version) => {
            expect(err).to.not.exist
            expect(version).to.equal('9000')
            done()
          })
        })
      })
    })

    // require('./blockstore-test')(repo)
  })
}
