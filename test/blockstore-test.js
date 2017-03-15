/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const Block = require('ipfs-block')
const CID = require('cids')
const mh = require('multihashes')
const parallel = require('async/parallel')
const waterfall = require('async/waterfall')
const each = require('async/each')
const map = require('async/map')
const _ = require('lodash')
const multihashing = require('multihashing-async')

module.exports = (repo) => {
  describe('blockstore', () => {
    const blockData = _.range(100).map((i) => new Buffer(`hello-${i}-${Math.random()}`))
    const bData = new Buffer('hello world')
    let b

    before((done) => {
      multihashing(bData, 'sha2-256', (err, h) => {
        if (err) {
          return done(err)
        }

        b = new Block(bData, new CID(h))
        done()
      })
    })

    describe('.put', () => {
      it('simple', (done) => {
        repo.blockstore.put(b, done)
      })

      it('multi write (locks)', (done) => {
        parallel([
          (cb) => repo.blockstore.put(b, cb),
          (cb) => repo.blockstore.put(b, cb)
        ], done)
      })

      it('massive multiwrite', (done) => {
        waterfall([
          (cb) => map(_.range(50), (i, cb) => {
            multihashing(blockData[i], 'sha2-256', cb)
          }, cb),
          (hashes, cb) => each(_.range(50), (i, cb) => {
            const block = new Block(blockData[i], new CID(hashes[i]))
            repo.blockstore.put(block, cb)
          }, cb)
        ], done)
      })

      it('returns an error on invalid block', (done) => {
        repo.blockstore.put('hello', (err) => {
          expect(err).to.exist
          done()
        })
      })
    })

    describe('.get', () => {
      it('simple', (done) => {
        repo.blockstore.get(b.cid, (err, block) => {
          expect(err).to.not.exist
          expect(block).to.be.eql(b)
          done()
        })
      })

      it('massive read', (done) => {
        parallel(_.range(20 * 100).map((i) => (cb) => {
          const j = i % blockData.length
          waterfall([
            (cb) => multihashing(blockData[j], 'sha2-256', cb),
            (h, cb) => {
              const cid = new CID(h)
              repo.blockstore.get(cid, cb)
            },
            (block, cb) => {
              expect(block.data).to.be.eql(blockData[j])
            }
          ], done)
        }))
      })

      it('returns an error on invalid block', (done) => {
        repo.blockstore.get('woot', (err, val) => {
          expect(err).to.exist
          expect(val).to.not.exist
          done()
        })
      })
    })

    describe('.has', () => {
      it('existing block', (done) => {
        repo.blockstore.has(b.cid, (err, exists) => {
          expect(err).to.not.exist
          expect(exists).to.eql(true)
          done()
        })
      })

      it('non existent block', (done) => {
        repo.blockstore.has(new CID('woot'), (err, exists) => {
          expect(err).to.not.exist
          expect(exists).to.eql(false)
          done()
        })
      })
    })

    describe('.delete', () => {
      it('simple', (done) => {
        waterfall([
          (cb) => repo.blockstore.delete(b.cid, cb),
          (cb) => repo.blockstore.has(b.cid, cb)
        ], (err, exists) => {
          expect(err).to.not.exist
          expect(exists).to.equal(false)
          done()
        })
      })
    })

    describe('interop', () => {
      it('reads welcome-to-ipfs', (done) => {
        const welcomeHash = mh.fromHexString(
          '1220120f6af601d46e10b2d2e11ed71c55d25f3042c22501e41d1246e7a1e9d3d8ec'
        )

        repo.blockstore.get(new CID(welcomeHash), (err, val) => {
          expect(err).to.not.exist
          expect(
            val.data.toString()
          ).to.match(
             /Hello and Welcome to IPFS/
          )
          done()
        })
      })
    })
  })
}
