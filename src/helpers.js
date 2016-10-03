export function processArgs(func, ...args) {
    for (let i = 0; i < args.length; i++) {
        if (Array.isArray(args[i])) {
            for (let j = 0; j < args[i].length; j++) {
                func(args[i][j]);
            }
        } else {
            func(args[i]);
        }
    }
}
export class SqlError extends Error {
    constructor(loc, msg) {
        super(msg);
        this.location = loc;
        this.message = msg;
    }
}
