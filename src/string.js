(function() {
    'use strict';

    const stringFunctions = {};

    stringFunctions.toCamel = function() {
        return this.replace(/[\-_][a-z]/g, (m) => {
            return m.toUpperCase().replace(/[\-_]/, '');
        });
    };
    stringFunctions.trim = function()  {
        return this.replace(/^\s+|\s+$/g, '');
    };
    stringFunctions.toDashCase = function()  {
        return this.replace(/[A-Z]/g, (m) => {
            return `-${m.toLowerCase()}`;
        });
    };
    stringFunctions.toSnakeCase = function()  {
        const result = this.replace(/[A-Z]/g, (m) => {
            return `_${m.toLowerCase()}`;
        });
        return (result[0] === '_') ? result.substring(1) : result;
    };
    stringFunctions.capitalizeFirst = function()  {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };
    stringFunctions.toPascal = function()  {
        return this.toCamel().capitalizeFirst();
    };
    stringFunctions.contains = function (s) {
        return this.indexOf(s) > -1;
    };

    for (const key in stringFunctions) {
        if (String.prototype.hasOwnProperty(key)) {
            continue;
        }
        Object.defineProperty(String.prototype, key, {
            value: stringFunctions[key],
            writable: true,
        });
    }

})();
