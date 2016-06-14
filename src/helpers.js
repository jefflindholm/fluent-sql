import util from 'util';

export function processArgs(func, ...args) {
    for (let i = 0; i < args.length; i++) {
        if ( util.isArray(args[i])) {
            for (let j = 0; j < args[i].length; j++) {
                func(args[i][j]);
            }
        } else {
            func(args[i]);
        }
    }
}