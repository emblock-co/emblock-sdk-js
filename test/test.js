var assert = require('assert')
var EmblockClient = require('../src/index')

const apiKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhdGhvbWFzLm5jQGdtYWlsLmNvbSIsIm9yZyI6ImRlbW8iLCJpc3MiOiJlbWJsb2NrIiwiaWF0IjoxNTU0Nzg1ODc1fQ.SVc_SjAmeGPnCYaOvLsSyUMioq4LzFuwpzwpAl3NS64'

describe('EmblockClient', () => {
  describe('#callConstant()', () => {
    it('it should do good', () => {
      assert.equal([1, 2, 3].indexOf(4), -1)
      const client = new EmblockClient()
    })
  })
})
