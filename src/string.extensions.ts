
interface String {
  toCamel(): string;
  trim(): string;
  toDashCase(): string;
  toSnakeCase(): string;
  toPascal(): string;
  capitalizeFirst(): string;
  contains(s: string): boolean;
  sqlEscape(sqlQuery?: any, level?: any): string;
}
String.prototype.toCamel = function toCamel() {
  return this.replace(/[\-_][a-z]/g, (m) => {
    return m.toUpperCase().replace(/[\-_]/, '');
  });
};
String.prototype.trim = function trim() {
  return this.replace(/^\s+|\s+$/g, '');
};
String.prototype.toDashCase = function toDashCase() {
  let result = this.replace(/[A-Z]/g, (m) => {
    return `-${m.toLowerCase()}`;
  });
  result = result.replace(/_/g, '-')
  return (result[0] === '-') ? result.substring(1) : result;
};
String.prototype.toSnakeCase = function toSnakeCase() {
  let result = this.replace(/[A-Z]/g, (m) => {
    return `_${m.toLowerCase()}`;
  });
  result = result.replace(/\-/g, '_')
  return (result[0] === '_') ? result.substring(1) : result;
};
function capFirst(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);

}
String.prototype.capitalizeFirst = function capitalizeFirst() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};
String.prototype.toPascal = function toPascal() {
  return capFirst(this.toCamel());
};
String.prototype.contains = function contains(s: string) {
  return this.indexOf(s) > -1;
};
