var expect = require('chai').expect;
require('../src/string.js');

describe('string tests', function() {
    it('should camel case a string using toCamel', function() {
        expect('snake_cased_string'.toCamel()).to.equal('snakeCasedString');
    });
    it('should break a camel case up by dashes using toDashCase', function() {
        expect('camelCaseString'.toDashCase()).to.equal('camel-case-string');
    });
    it('should break a camel case up by underscores using toSnakeCase', function() {
        expect('camelCaseString'.toSnakeCase()).to.equal('camel_case_string');
        expect('CamelCaseString'.toSnakeCase()).to.equal('camel_case_string');
    });
    it('should capitalize the first character of a string', function() {
        expect('somestring'.capitalizeFirst()).to.equal('Somestring');
    });
    it('should pascal case a string using toPascal', function() {
        expect('yet_another_string'.toPascal()).to.equal('YetAnotherString');
    });
    it('should trim spaces from a string', function() {
        expect(' this '.trim()).to.equal('this');
    });
    it('should return true if a string contains a specified string, using .contains', function() {
        expect('this is a string'.contains('is a')).to.equal(true);
    });
    it('should return false if a string contains a specified string, using .contains', function() {
        expect('this is a string'.contains('is b')).to.equal(false);
    });
});
