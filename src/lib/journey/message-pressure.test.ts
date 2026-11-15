import { expect, it } from 'vitest';
import { pressurePhrases, TONE_DEMO_DRAFT } from './message-pressure';
it('the example draft flags last chance and don’t miss out', () => {
  expect(pressurePhrases(TONE_DEMO_DRAFT)).toEqual(['last chance', "don't miss out"]);
});
it('removes flags when the coordinator uses gentle wording', () => {
  expect(pressurePhrases('You are welcome to join if it suits you.')).toEqual([]);
});