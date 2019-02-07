"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.processArgs = processArgs;exports.SqlError = void 0;function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function processArgs(func) {for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {args[_key - 1] = arguments[_key];}
  for (var i = 0; i < args.length; i++) {
    if (Array.isArray(args[i])) {
      for (var j = 0; j < args[i].length; j++) {
        func(args[i][j]);
      }
    } else {
      func(args[i]);
    }
  }
}var
SqlError =
function SqlError(loc, msg) {_classCallCheck(this, SqlError);
  // super(msg);
  this.location = loc;
  this.message = msg;
};exports.SqlError = SqlError;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9oZWxwZXJzLmpzIl0sIm5hbWVzIjpbInByb2Nlc3NBcmdzIiwiZnVuYyIsImFyZ3MiLCJpIiwibGVuZ3RoIiwiQXJyYXkiLCJpc0FycmF5IiwiaiIsIlNxbEVycm9yIiwibG9jIiwibXNnIiwibG9jYXRpb24iLCJtZXNzYWdlIl0sIm1hcHBpbmdzIjoiNFJBQU8sU0FBU0EsV0FBVCxDQUFxQkMsSUFBckIsRUFBb0MsbUNBQU5DLElBQU0sdUVBQU5BLElBQU07QUFDdkMsT0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHRCxJQUFJLENBQUNFLE1BQXpCLEVBQWlDRCxDQUFDLEVBQWxDLEVBQXNDO0FBQ2xDLFFBQUlFLEtBQUssQ0FBQ0MsT0FBTixDQUFjSixJQUFJLENBQUNDLENBQUQsQ0FBbEIsQ0FBSixFQUE0QjtBQUN4QixXQUFLLElBQUlJLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUdMLElBQUksQ0FBQ0MsQ0FBRCxDQUFKLENBQVFDLE1BQTVCLEVBQW9DRyxDQUFDLEVBQXJDLEVBQXlDO0FBQ3JDTixRQUFBQSxJQUFJLENBQUNDLElBQUksQ0FBQ0MsQ0FBRCxDQUFKLENBQVFJLENBQVIsQ0FBRCxDQUFKO0FBQ0g7QUFDSixLQUpELE1BSU87QUFDSE4sTUFBQUEsSUFBSSxDQUFDQyxJQUFJLENBQUNDLENBQUQsQ0FBTCxDQUFKO0FBQ0g7QUFDSjtBQUNKLEM7QUFDWUssUTtBQUNULGtCQUFZQyxHQUFaLEVBQWlCQyxHQUFqQixFQUFzQjtBQUNsQjtBQUNBLE9BQUtDLFFBQUwsR0FBZ0JGLEdBQWhCO0FBQ0EsT0FBS0csT0FBTCxHQUFlRixHQUFmO0FBQ0gsQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzQXJncyhmdW5jLCAuLi5hcmdzKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGFyZ3NbaV0pKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGFyZ3NbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBmdW5jKGFyZ3NbaV1bal0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZnVuYyhhcmdzW2ldKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBTcWxFcnJvciB7XG4gICAgY29uc3RydWN0b3IobG9jLCBtc2cpIHtcbiAgICAgICAgLy8gc3VwZXIobXNnKTtcbiAgICAgICAgdGhpcy5sb2NhdGlvbiA9IGxvYztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbXNnO1xuICAgIH1cbn1cbiJdfQ==