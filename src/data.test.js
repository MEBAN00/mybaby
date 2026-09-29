import assert from 'node:assert/strict'
import test from 'node:test'
import { keepsake } from './data.js'

test('keepsake content is complete enough to render', () => {
  assert.ok(keepsake.name && keepsake.from)
  assert.equal(keepsake.songs.length, 3)
  assert.ok(keepsake.songs.every((song) => song.title && song.length && song.src))
  assert.ok(keepsake.photos.length >= 5)
  assert.ok(keepsake.photos.every((photo) => photo.src && photo.alt && photo.caption))
  assert.ok(keepsake.letter.length >= 2)
})
