function toCamel() {
    return this.replace(/[\-_][a-z]/g, (m) => {
        return m.toUpperCase().replace(/[\-_]/, '');
    });
};
function trim()  {
    return this.replace(/^\s+|\s+$/g, '');
};
function toDashCase()  {
    let result = this.replace(/[A-Z]/g, (m) => {
        return `-${m.toLowerCase()}`;
    });
    result = result.replace(/_/g, '-')
    return (result[0] === '-') ? result.substring(1) : result;
};
function toSnakeCase()  {
    let result = this.replace(/[A-Z]/g, (m) => {
        return `_${m.toLowerCase()}`;
    });
    result = result.replace(/\-/g, '_')
    return (result[0] === '_') ? result.substring(1) : result;
};
function capitalizeFirst()  {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
function toPascal()  {
    return this.toCamel().capitalizeFirst();
};
function contains (s) {
    return this.indexOf(s) > -1;
};

(function() {
    'use strict';
    const stringFunctions = {
        toCamel,
        trim,
        toDashCase,
        toSnakeCase,
        capitalizeFirst,
        toPascal,
        contains,
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

export default {
    toCamel,
    trim,
    toDashCase,
    toSnakeCase,
    capitalizeFirst,
    toPascal,
    contains,
};
