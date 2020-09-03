export function processArgs(func: any, ...args: any) {
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
export class SqlError {
    constructor(loc: string, msg: string) {
        // super(msg);
        this.location = loc;
        this.message = msg;
    }
  location: string;
  message: string;
}
