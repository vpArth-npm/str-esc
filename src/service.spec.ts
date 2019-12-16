import each from 'jest-each';
import { EscapeService, EscapeServiceFlagEnum } from './service';

describe('EscapeService', () => {
  describe('should encode', () => {
    each([
      ['A\\B%C', 'A\\\\B\\%C', ['%'], '\\'],
      ['descendant system', 'descescendant escsystem', ['sys'], 'esc'],
    ]).it(`%s into %s with %s and %s`, (src, expected, listToEsc, esc) => {
      const svc = new EscapeService(esc);
      expect(svc.encode(src, listToEsc)).toBe(expected);
    });

    it('with backslash by default', () => {
      const svc = new EscapeService();
      expect(svc.encode('\\')).toBe('\\\\');
    });
  });

  describe('should split/join', () => {
    each([
      ['A,B,comma is \\,', ['A', 'B', 'comma is ,'], ',', '\\'],
      ['Asepescescsepescseparator is escsepsep', ['A', 'esc', 'separator is sep', ''], 'sep', 'esc'],
    ]).it('%s into %s with %s and %s', (src, expected, sep, esc) => {
      const svc  = new EscapeService(esc);
      const list = svc.split(sep, src);
      expect(list).toEqual(expected);
      const joined = svc.join(sep, list);
      expect(joined).toBe(src);
    });

    it('edge cases', () => {
      const sep = 'sep';
      const svc = new EscapeService('esc');

      expect(svc.split(sep, 'AsepBesc')).toEqual(['A', 'Besc']);
      svc.setFlag(EscapeServiceFlagEnum.LEAVE_LAST_ESCAPE, false);
      expect(svc.split(sep, 'AsepBesc')).toEqual(['A', 'B']);

      expect(svc.split(sep, 'escAsepB')).toEqual(['A', 'B']);
      svc.setFlag(EscapeServiceFlagEnum.LEAVE_EXCESS_ESCAPE, true);
      expect(svc.split(sep, 'escAsepB')).toEqual(['escA', 'B']);
    });

    each([
      ['макакяа', 'а', ['м', 'к', 'ка'], 'я'],
      ['ключ.а', '.', ['ключ', 'а'], '\\'],
    ]).it(`'%s'.split('%s') = %s; esc = %s`, (src, sep, expected, esc) => {
      const svc = new EscapeService(esc);

      const actual = svc.split(sep, src);

      expect(actual).toEqual(expected);
    });
  });
  describe('should join', () => {
    each([
      ['A,B,comma is \\,', ['A', 'B', 'comma is ,'], ',', '\\'],
      ['A,escesc,comma is esc,', ['A', 'esc', 'comma is ,'], ',', 'esc'],
      ['.,\\,,\\\\', ['.', ',', '\\'], ',', '\\'],
    ]).it('to %s from %s with %s and %s', (expected, list, sep, esc) => {
      const svc = new EscapeService(esc);
      expect(svc.join(sep, list)).toBe(expected);
    });
    it('with limit', () => {
      expect(new EscapeService('\\').split(',', 'a,b\\,c,d,\\e\\', 3))
        .toEqual(['a', 'b,c', 'd,\\e\\']);
    });
  });
});
