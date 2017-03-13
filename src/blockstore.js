'use strict'

const NamespaceStore = require('datastore-core').NamespaceDatastore
const Key = require('interface-datastore').Key
const multibase = require('multibase')

const blockPrefix = new Key('blocks')

/**
 * @param {Buffer} rawKey
 * @returns {Key}
 */
const keyFromBuffer = (rawKey) => {
  const mbase = multibase.encode(multibase.base32, rawKey)
  return new Key('/' + mbase.slice(1), false)
}

/**
 * Transform a cid to the appropriate datastore key.
 *
 * @param {CID} cid
 * @returns {Key}
 */
const cidToDsKey = (cid) => {
  return keyFromBuffer(cid.buffer)
}

module.exports = (repo) => {
  const store = new NamespaceStore(repo.store, blockPrefix)
  return {
    /**
     * Get a single block by CID.
     *
     * @param {CID} cid
     * @param {function(Error, Block)} callback
     * @returns {void}
     */
    get (cid, callback) {
      const k = cidToDsKey(cid)
      store.get(k, (err, blockData) => {
        if (err) {
          return callback(err)
        }

        callback(null, new Block(data, cid))
      })
    },
    put (block, callback) {
      const k = cidToDsKey(block.cid)

      store.has(k, (err, exists) => {
        if (err) {
          return callback(err)
        }
        if (exists) {
          return callback()
        }

        store.put(k, block.data, callback)
      })
    },
    /**
     * Like put, but for more.
     *
     * @param {Array<Block>} blocks
     * @param {function(Error)} callback
     * @returns {void}
     */
    putMany (blocks, callback) {
      const keys = blocks.map((b) => cidToDsKey(b.cid))
      const batch = store.batch()
      each(keys, (k, i) => {
        store.has(k, (err, exists) => {
          if (err) {
            return cb(err)
          }
          if (exists) {
            return cb()
          }
          batch.put(k, blocks[i].data)
        })
      }, (err) => {
        if (err) {
          return callback(err)
        }
        batch.commit(callback)
      })
    },
    /**
     * Does the store contain block with this cid?
     *
     * @param {CID} cid
     * @param {function(Error, bool)} callback
     * @returns {void}
     */
    has (cid, callback) {
      store.has(cidToDsKey(cid), callback)
    },
    /**
     * Delete a block from the store
     *
     * @param {CID} cid
     * @param {function(Error)} callback
     * @returns {void}
     */
    delete (cid, callback) {
      store.delete(cidToDsKey(cid), callback)
    }
  }
}
