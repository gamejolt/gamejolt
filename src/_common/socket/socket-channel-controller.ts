import { Channel } from 'phoenix';
import { markRaw, shallowReadonly } from 'vue';
import { createLogger } from '../../utils/logging';
import { retryWithBackoff, SocketController } from './socket-controller';

export type SocketChannelController = ReturnType<typeof createSocketChannelController>;

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
		return retryWithBackoff(
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
