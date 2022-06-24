import { Channel, Socket } from 'phoenix';
import { markRaw, ref, shallowReadonly, shallowRef } from 'vue';
import { CancelToken } from '../../utils/cancel-token';
import { createLogger } from '../../utils/logging';
import { sleep } from '../../utils/utils';
import { Api } from '../api/api.service';
import { getCookie } from '../cookie/cookie.service';
import { CommonStore } from '../store/common-store';

export type SocketController = ReturnType<typeof createSocketController>;
export type SocketChannelController = ReturnType<typeof createSocketChannelController>;

export function createSocketController(options: {
	logContext: string;
	commonStore: CommonStore;
	onDisconnect: () => void;
}) {
	const { onDisconnect, commonStore, logContext } = options;
	const { user, isUserTimedOut } = commonStore;

	const logger = createLogger(`Socket/${logContext}`);

	const connected = ref(false);
	const socket = shallowRef<Socket>();

	/**
	 * Used to abort a single connection flow so we can cleanly retry.
	 */
	const cancelToken = shallowRef(new CancelToken());

	async function connect(connectOptions: {
		socketUrl: string;
		isGuest: boolean;
		guestToken?: string | null;
		hostSuffix?: string;
	}): Promise<boolean> {
		const { socketUrl, isGuest, guestToken, hostSuffix } = connectOptions;

		const ourCancelToken = new CancelToken();
		cancelToken.value.cancel();
		cancelToken.value = ourCancelToken;

		logger.info('Connecting...');

		const hasUser = !!user.value;
		if ((!isGuest && !hasUser) || (isGuest && hasUser)) {
			return false;
		}

		const authToken = isGuest ? guestToken : await getCookie('frontend');
		ourCancelToken.assert();

		if (!authToken || isUserTimedOut.value) {
			// Not properly logged in.
			return false;
		}

		const results = await _retryWithBackoff(
			`${logContext} Connect`,
			ourCancelToken,
			async () => {
				// Fetch the host from load balancer first. This request will get
				// rate limited and only let a certain number through, which will
				// cause our second request to not get processed until we're let in.
				const hostResult = await Api.sendRawRequest(`${socketUrl}/host`, {
					timeout: 3_000,
				});

				ourCancelToken.assert();

				logger.info(`Host selected: ${hostResult.data}`);

				const tokenResult = await Api.sendRawRequest(`${socketUrl}/token`, {
					data:
						user.value && !isGuest
							? { auth_token: authToken, user_id: user.value.id }
							: { auth_token: authToken },
					timeout: 3_000,
				});

				return { host: hostResult, token: tokenResult };
			}
		);

		if (ourCancelToken.isCanceled) {
			logger.info('Aborted.');
			return false;
		}

		if (!results) {
			return false;
		}

		let host = `${results.host.data}`;
		const token = results.token.data.token;

		if (hostSuffix) {
			host += hostSuffix;
		}

		logger.info(`Got token from host: ${host}`);

		const newSocket = new Socket(host, {
			heartbeatIntervalMs: 30_000,
			params: {
				token,
				gj_platform: GJ_IS_DESKTOP_APP ? 'client' : 'web',
				gj_platform_version: GJ_VERSION,
			},
		});

		socket.value = markRaw(newSocket);

		// HACK! There is no built in way to stop a Phoenix socket from
		// attempting to reconnect on its own after it got disconnected. This
		// replaces the socket's "reconnectTimer" property with an empty object
		// that matches the Phoenix "Timer" signature. The 'reconnectTimer'
		// usually restarts the connection after a delay, this prevents that
		// from happening.
		const socketAny: any = newSocket;
		if (Object.prototype.hasOwnProperty.call(socketAny, 'reconnectTimer')) {
			socketAny.reconnectTimer = { scheduleTimeout: () => {}, reset: () => {} };
		}

		return new Promise((resolve, _reject) => {
			newSocket.onOpen(() => {
				if (ourCancelToken.isCanceled) {
					resolve(false);
					return;
				}

				connected.value = true;
				logger.info('Connected to socket.');

				resolve(true);
			});

			// Below we trigger on error and on close. We only want to call
			// onDisconnect once, though, just in case both trigger.
			let alertedDisconnect = false;

			newSocket.onError((e: any) => {
				if (alertedDisconnect) {
					return;
				}
				alertedDisconnect = true;
				connected.value = false;

				if (!ourCancelToken.isCanceled) {
					logger.warn('Got error from socket.', e);
					onDisconnect();
				}
				resolve(false);
			});

			newSocket.onClose(() => {
				if (alertedDisconnect) {
					return;
				}
				alertedDisconnect = true;
				connected.value = false;

				if (!ourCancelToken.isCanceled) {
					logger.warn('Socket closed unexpectedly.');
					onDisconnect();
				}
				resolve(false);
			});

			// This will try to connect and then we'll resolve once the socket
			// is open.
			newSocket.connect();
		});
	}

	function disconnect() {
		logger.info('Disconnecting socket.');

		cancelToken.value.cancel();
		socket.value?.disconnect();
		socket.value = undefined;
	}

	return shallowReadonly({
		socket,
		connected,
		cancelToken,

		connect,
		disconnect,
	});
}

export function createSocketChannelController(
	topic: string,
	socketController: SocketController,
	params?: Record<string, any>
) {
	const { socket } = socketController;

	const logger = createLogger(`Socket Channel/${topic}`);

	// Freeze the cancel token.
	const cancelToken = socketController.cancelToken.value;

	const channel = markRaw(new Channel(topic, params, socket.value));
	(socket.value as any).channels.push(channel);

	/**
	 * Joins the channel, will call [onJoin] when the channel joins
	 * successfully. If any errors are thrown in this callback, it'll retry the
	 * join again.
	 */
	function join(options: { onJoin?: (msg: any) => Promise<void>; onLeave?: () => void } = {}) {
		const { onJoin, onLeave } = options;

		// Below we trigger on error and on close. We only want to call onLeave
		// once, though, just in case both trigger.
		let alertedLeave = false;

		function _handleLeave() {
			if (alertedLeave) {
				return;
			}
			alertedLeave = true;
			onLeave?.();
		}

		channel.onError(_handleLeave);
		channel.onClose(_handleLeave);

		// Now we try to join the channel.
		return _retryWithBackoff(
			`Join channel ${topic}`,
			cancelToken,
			() =>
				new Promise<void>((resolve, reject) => {
					channel
						.join()
						.receive('error', reject)
						.receive('ok', async msg => {
							cancelToken.assert();

							try {
								if (onJoin) {
									await onJoin(msg);
								}

								// I'm not sure if we want to check cancel
								// before resolving since technically they are
								// joined at this point and we may need to
								// finish out the rest of the join code so we
								// can tear down properly?

								resolve();
							} catch (e) {
								reject(e);
							}
						});
				})
		);
	}

	/**
	 * Leaves the channel.
	 */
	async function leave() {
		logger.info(`Leaving channel.`);

		const leavePromise = new Promise((resolve, reject) => {
			channel.leave().receive('error', reject).receive('ok', resolve);
		});

		try {
			await leavePromise;
			socket.value?.remove(channel);

			logger.info(`Left channel.`);
		} catch (e) {
			logger.warn(
				`Potential error while leaving. Ignoring and treating the channel as left.`
			);
		}
	}

	/**
	 * Listen to a particular event on the channel.
	 */
	function listenTo(event: string, callback: (response?: any) => void) {
		// We wrap the event so that we can check the cancel token and
		// short-circuit the callback if it's no longer valid.
		channel.on(event, response => {
			if (cancelToken.isCanceled) {
				return;
			}

			callback(response);
		});
	}

	/**
	 * Pushes an event to the channel and wraps it in a Promise.
	 */
	function push<T = unknown>(
		eventName: string,
		payload: Record<string, any> = {},
		timeout?: number
	) {
		return new Promise<T>((resolve, reject) => {
			const push = channel
				.push(eventName, payload, timeout)
				.receive('ok', resolve)
				.receive('error', e => {
					logger.warn(`Got error for event ${eventName}`, e);
					reject(e);
				});

			if (timeout) {
				push.receive('timeout', e => {
					logger.warn(`Got timeout for event ${eventName}`, e);
					reject(e);
				});
			}
		});
	}

	return shallowReadonly({
		topic,
		channel,
		join,
		leave,
		listenTo,
		push,
	});
}

/**
 * Polls a function until it returns a result without throwing, increases the
 * delay between each attempt.
 */
async function _retryWithBackoff<T>(
	logContext: string,
	cancelToken: CancelToken,
	fn: () => Promise<T>
): Promise<T> {
	let delay = 0;

	const { info, error } = createLogger(logContext);

	info(`Attempting request.`);

	// eslint-disable-next-line no-constant-condition
	while (true) {
		try {
			const result = await fn();

			// We don't return the result if it was canceled in the middle.
			cancelToken.assert();

			info(`Completed request.`);

			return result;
		} catch (e) {
			// This will catch from the above cancelation as well as if there
			// was an actual error in the request and we're now canceled.
			if (cancelToken.isCanceled) {
				throw e;
			}

			if (delay < 30_000) {
				delay += 1_000 + Math.random() * 1_000;
			}

			error(`Failed request. Reattempt in ${delay}ms.`);
			await sleep(delay);
		}
	}
}
