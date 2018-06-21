import strings from '../src/string';
const {
  toCamel,
  trim,
  toDashCase,
  toSnakeCase,
  capitalizeFirst,
  toPascal,
  contains,
} = strings;

describe('string tests', () => {
  describe('base functions', () => {
    it('should camel case a string using toCamel', () => {
      expect(toCamel.bind('snake_cased_string')()).toBe('snakeCasedString');
    });
    it('should convert from dash to snake', () => {
      expect(toSnakeCase.bind('camel-case-string')()).toBe('camel_case_string');
    });
    it('should convert from snake to dash', () => {
      expect(toDashCase.bind('camel_case_string')()).toBe('camel-case-string');
    });
    it('should break a camel case up by dashes using toDashCase', () => {
      expect(toDashCase.bind('camelCaseString')()).toBe('camel-case-string');
      expect(toDashCase.bind('CamelCaseString')()).toBe('camel-case-string');
    });
    it('should break a camel case up by underscores using toSnakeCase', () => {
      expect(toSnakeCase.bind('camelCaseString')()).toBe('camel_case_string');
      expect(toSnakeCase.bind('CamelCaseString')()).toBe('camel_case_string');
    });
    it('should capitalize the first character of a string', () => {
      expect(capitalizeFirst.bind('somestring')()).toBe('Somestring');
    });
    it('should pascal case a string using toPascal', () => {
      expect(toPascal.bind('yet_another_string')()).toBe('YetAnotherString');
    });
    it('should trim spaces from a string', () => {
      expect(trim.bind(' this ')()).toBe('this');
    });
    it('should return true if a string contains a specified string, using .contains', () => {
      expect(contains.bind('this is a string')('is a')).toBe(true);
    });
    it('should return false if a string contains a specified string, using .contains', () => {
      expect(contains.bind('this is a string')('is b')).toBe(false);
    });
  });
  describe('on string object', () => {
    it('should camel case a string using toCamel', () => {
      expect('snake_cased_string'.toCamel()).toBe('snakeCasedString');
    });
    it('should convert from dash to snake', () => {
      expect('camel-case-string'.toSnakeCase()).toBe('camel_case_string');
    });
    it('should convert from snake to dash', () => {
      expect('camel_case_string'.toDashCase()).toBe('camel-case-string');
    });
    it('should break a camel case up by dashes using toDashCase', () => {
      expect('camelCaseString'.toDashCase()).toBe('camel-case-string');
      expect('CamelCaseString'.toDashCase()).toBe('camel-case-string');
    });
    it('should break a camel case up by underscores using toSnakeCase', () => {
      expect('camelCaseString'.toSnakeCase()).toBe('camel_case_string');
      expect('CamelCaseString'.toSnakeCase()).toBe('camel_case_string');
    });
    it('should capitalize the first character of a string', () => {
      expect('somestring'.capitalizeFirst()).toBe('Somestring');
    });
    it('should pascal case a string using toPascal', () => {
      expect('yet_another_string'.toPascal()).toBe('YetAnotherString');
    });
    it('should trim spaces from a string', () => {
      expect(' this '.trim()).toBe('this');
    });
    it('should return true if a string contains a specified string, using .contains', () => {
      expect('this is a string'.contains('is a')).toBe(true);
    });
    it('should return false if a string contains a specified string, using .contains', () => {
      expect('this is a string'.contains('is b')).toBe(false);
    });
  });
});
