import assert from 'node:assert/strict'
import test from 'node:test'
import { isBlowing } from './blowDetection.js'

test('detects a sustained loud breath, not normal room noise', () => {
  assert.equal(isBlowing(new Uint8Array([8, 14, 20, 18])), false)
  assert.equal(isBlowing(new Uint8Array([52, 61, 47, 58])), true)
  assert.equal(isBlowing(new Uint8Array()), false)
})
