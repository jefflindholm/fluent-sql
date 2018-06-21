'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function toCamel() {
    return this.replace(/[\-_][a-z]/g, function (m) {
        return m.toUpperCase().replace(/[\-_]/, '');
    });
};
function trim() {
    return this.replace(/^\s+|\s+$/g, '');
};
function toDashCase() {
    var result = this.replace(/[A-Z]/g, function (m) {
        return '-' + m.toLowerCase();
    });
    result = result.replace(/_/g, '-');
    return result[0] === '-' ? result.substring(1) : result;
};
function toSnakeCase() {
    var result = this.replace(/[A-Z]/g, function (m) {
        return '_' + m.toLowerCase();
    });
    result = result.replace(/\-/g, '_');
    return result[0] === '_' ? result.substring(1) : result;
};
function capitalizeFirst() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
function toPascal() {
    return this.toCamel().capitalizeFirst();
};
function contains(s) {
    return this.indexOf(s) > -1;
};

(function () {
    'use strict';

    var stringFunctions = {
        toCamel: toCamel,
        trim: trim,
        toDashCase: toDashCase,
        toSnakeCase: toSnakeCase,
        capitalizeFirst: capitalizeFirst,
        toPascal: toPascal,
        contains: contains
    };

    for (var key in stringFunctions) {
        if (String.prototype.hasOwnProperty(key)) {
            continue;
        }
        Object.defineProperty(String.prototype, key, {
            value: stringFunctions[key],
            writable: true
        });
    }
})();

exports.default = {
    toCamel: toCamel,
    trim: trim,
    toDashCase: toDashCase,
    toSnakeCase: toSnakeCase,
    capitalizeFirst: capitalizeFirst,
    toPascal: toPascal,
    contains: contains
};