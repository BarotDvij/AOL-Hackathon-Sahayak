import { expect, it } from 'vitest';
import { pressurePhrases } from './message-pressure';
it('flags last chance in coordinator edits regardless of case', () => {
  expect(pressurePhrases('This is your LAST CHANCE to join.')).toEqual(['last chance']);
});
it('flags don’t miss out with straight or curly apostrophes', () => {
  expect(pressurePhrases("Please don't miss out!")).toEqual(["don't miss out"]);
  expect(pressurePhrases('Don’t miss out on this course.')).toEqual(["don't miss out"]);
});
it('clears the warning when pressure wording is removed', () => {
  expect(pressurePhrases('You’re welcome to join if it suits you. No pressure.')).toEqual([]);
  expect(pressurePhrases('A chance to reconnect; we miss you.')).toEqual([]);
});