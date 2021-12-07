import { types } from 'util';

export function isErrnoException(err: any): err is NodeJS.ErrnoException {
	return types.isNativeError(err) && typeof (err as any).code === 'string' && !!(err as any).code;
}
