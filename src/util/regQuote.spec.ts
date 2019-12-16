import each from 'jest-each';
import { regQuote } from './regQuote';

describe('regQuote function', () => {
  each([
    ['\\.', '\\\\\\.'],
    ['[Hello]', '\\[Hello\\]'],
    ['(Hello)', '\\(Hello\\)'],
    ['{Hello}', '\\{Hello\\}'],
    ['+-*{1,3}', '\\+\\-\\*\\{1,3\\}'],
    ['$^', '\\$\\^'],
  ]).it('should convert %s into %s', (src, expected) => {
    const actual = regQuote(src);
    expect(actual).toBe(expected);
  });
});
