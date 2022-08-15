const util = require('util') as typeof import('util');

export function isErrnoException(err: any): err is NodeJS.ErrnoException {
	return (
		util.types.isNativeError(err) &&
		typeof (err as any).code === 'string' &&
		!!(err as any).code
	);
}
