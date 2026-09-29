import assert from 'node:assert/strict'
import test from 'node:test'
import { movePage } from './navigation.js'

test('moves back from the letter to photos instead of returning to the cake', () => {
  assert.equal(movePage(4, -1, 5), 3)
  assert.equal(movePage(3, -1, 5), 2)
  assert.equal(movePage(4, 1, 5), 0)
})
