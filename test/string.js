var expect = require('chai').expect;
require('../src/string.js');

describe('string tests', () => {
    it('should camel case a string using toCamel', () => {
        expect('snake_cased_string'.toCamel()).to.equal('snakeCasedString');
    });
    it('should convert from dash to snake', () => {
        expect('camel-case-string'.toSnakeCase()).to.equal('camel_case_string');
    });
    it('should convert from snake to dash', () => {
        expect('camel_case_string'.toDashCase()).to.equal('camel-case-string');
    });
    it('should break a camel case up by dashes using toDashCase', () => {
        expect('camelCaseString'.toDashCase()).to.equal('camel-case-string');
        expect('CamelCaseString'.toDashCase()).to.equal('camel-case-string');
    });
    it('should break a camel case up by underscores using toSnakeCase', () => {
        expect('camelCaseString'.toSnakeCase()).to.equal('camel_case_string');
        expect('CamelCaseString'.toSnakeCase()).to.equal('camel_case_string');
    });
    it('should capitalize the first character of a string', () => {
        expect('somestring'.capitalizeFirst()).to.equal('Somestring');
    });
    it('should pascal case a string using toPascal', () => {
        expect('yet_another_string'.toPascal()).to.equal('YetAnotherString');
    });
    it('should trim spaces from a string', () => {
        expect(' this '.trim()).to.equal('this');
    });
    it('should return true if a string contains a specified string, using .contains', () => {
        expect('this is a string'.contains('is a')).to.equal(true);
    });
    it('should return false if a string contains a specified string, using .contains', () => {
        expect('this is a string'.contains('is b')).to.equal(false);
    });
});
