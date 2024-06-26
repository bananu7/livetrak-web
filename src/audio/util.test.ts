import { expect, test } from 'vitest'
import { faderPosToDb } from '../audio/util'

const faderMidPoint = 80;

test('fader pos is 0dB at midpoint', () => {
  expect(faderPosToDb(faderMidPoint)).toBe(0);
})

test('fader pos is +10dB at max', () => {
  expect(faderPosToDb(100)).toBe(10);
})
