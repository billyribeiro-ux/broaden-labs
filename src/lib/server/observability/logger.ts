/**
 * Structured server logging. Brief §92.
 *
 * One line of JSON per event, so it is greppable in a terminal and parseable by
 * a log platform without a shipper-side regex.
 *
 * What is NEVER logged, and the reason:
 *   - the inquiry message body: it is the visitor's confidential problem
 *   - email addresses: identifying, and the row already holds it
 *   - raw IP addresses: only the salted hash goes anywhere
 *   - secrets or full request headers
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
	readonly requestId?: string | undefined;
	readonly route?: string | undefined;
	readonly event?: string | undefined;
	readonly outcome?: string | undefined;
	readonly durationMs?: number | undefined;
	readonly ipHash?: string | undefined;
	readonly errorId?: string | undefined;
	readonly errorName?: string | undefined;
	readonly [key: string]: string | number | boolean | undefined;
}

function emit(level: LogLevel, message: string, context: LogContext = {}): void {
	const entry = {
		level,
		message,
		timestamp: new Date().toISOString(),
		...context
	};

	const line = JSON.stringify(entry);
	if (level === 'error') console.error(line);
	else if (level === 'warn') console.warn(line);
	else console.log(line);
}

export const logger = {
	debug: (message: string, context?: LogContext) => emit('debug', message, context),
	info: (message: string, context?: LogContext) => emit('info', message, context),
	warn: (message: string, context?: LogContext) => emit('warn', message, context),
	error: (message: string, context?: LogContext) => emit('error', message, context)
};
