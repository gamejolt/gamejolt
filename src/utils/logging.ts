export type Logger = ReturnType<typeof createLogger>;

/**
 * Simple function to create a logger that prefixes each log message.
 */
export function createLogger(name: string) {
	const _createLevel =
		(level: 'info' | 'debug' | 'warn' | 'error') =>
		(message: any, ...optionalParams: any[]) =>
			console[level](`[${name}] ${message}`, ...optionalParams);

	return {
		info: _createLevel('info'),
		debug: _createLevel('debug'),
		warn: _createLevel('warn'),
		error: _createLevel('error'),
	};
}
