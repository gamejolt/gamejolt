import { Socket, Channel } from 'phoenix';
import { Growls } from '../../../lib/gj-lib-client/components/growls/growls.service';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { store } from '../../store/index';
import { getCookie } from '../../../_common/cookie/cookie.service';
import {
	Notification,
	getNotificationText,
} from '../../../lib/gj-lib-client/components/notification/notification-model';
import { Translate } from '../../../lib/gj-lib-client/components/translate/translate.service';
import { router } from '../../views';
import Axios from 'axios';
import { sleep } from '../../../lib/gj-lib-client/utils/utils';

interface NewNotificationPayload {
	notification_data: {
		event_item: any;
	};
}

/**
 * Polls a request until it returns a result, increases the delay time between requests after each failed attempt.
 * @param context Context for logging
 * @param requestGetter Function that generates a promise that represents the request
 */
async function pollRequest(context: string, requestGetter: () => Promise<any>): Promise<any> {
	let result = null;
	let finished = false;

	let delay = 0;

	console.log(`[Grid] ${context}`);

	while (!finished) {
		try {
			const promise = requestGetter();
			result = await promise;
			finished = true;
		} catch (e) {
			const sleepMs = Math.min(30000, Math.random() * delay * 1000 + 1000);
			console.log(`[Grid] Failed request [${context}]. Reattempt in ${sleepMs} ms.`);
			await sleep(sleepMs);
		}

		delay++;
	}

	return result;
}

export class GridClient {
	connected = false;
	socket: Socket | null = null;
	channels: Channel[] = [];

	constructor() {
		this.connect();
	}

	private async connect() {
		if (GJ_IS_SSR) {
			return;
		}

		const cookie = await getCookie('frontend');
		const user = store.state.app.user;

		if (user === null || cookie === undefined) {
			// not properly logged in
			return;
		}

		console.log('[Grid] Connecting...');

		// get hostname from loadbalancer first
		const hostResult = await pollRequest('Select server', () =>
			Axios.get(Environment.gridHost)
		);
		const host = `ws://${hostResult.data}/grid/socket`;

		console.log('[Grid] Server selected:', host);

		const userId = user.id.toString();

		// heartbeat is 10 seconds, backend disconnects after 30 seconds
		this.socket = new Socket(host, {
			heartbeatIntervalMs: 10000,
		});

		// HACK
		// there is no built in way to stop a Phoenix socket from attempting to reconnect on its own after it got disconnected.
		// this replaces the socket's "reconnectTimer" property with an empty object that matches the Phoenix "Timer" signature
		// The 'reconnectTimer' usually restarts the connection after a delay, this prevents that from happening
		let socketAny: any = this.socket;
		if (socketAny.hasOwnProperty('reconnectTimer')) {
			socketAny.reconnectTimer = { scheduleTimeout: () => {}, reset: () => {} };
		}

		await pollRequest(
			'Connect to socket',
			() =>
				new Promise(resolve => {
					if (this.socket !== null) {
						this.socket.connect();
					}
					resolve();
				})
		);

		const channel = this.socket.channel('notifications:' + userId, {
			frontend_cookie: cookie,
		});

		await pollRequest(
			'Join user notification channel',
			() =>
				new Promise((resolve, reject) => {
					channel
						.join()
						.receive('error', reject)
						.receive('ok', () => {
							this.connected = true;
							this.channels.push(channel);
							resolve();
						});
				})
		);

		channel.on('new-notification', (payload: NewNotificationPayload) =>
			this.handleNotification(payload)
		);

		channel.onError(reason => {
			console.log(`[Grid] Connection error encountered (Reason: ${reason}).`);
			// teardown and try to reconnect
			if (this.connected) {
				this.disconnect();
				this.connect();
			}
		});
	}

	handleNotification(payload: NewNotificationPayload) {
		if (this.connected) {
			const data = payload.notification_data.event_item;
			const notification = new Notification(data);

			switch (notification.type) {
				case Notification.TYPE_FRIENDSHIP_CANCEL:
					// this special type of notification only decrements the friend request number
					store.commit('changeFriendRequestCount', -1);
					break;

				case Notification.TYPE_FRIENDSHIP_REQUEST:
					// for an incoming friend request, increase the friend request number
					store.commit('changeFriendRequestCount', 1);
					this.spawnNotification(notification);
					break;

				default:
					this.spawnNotification(notification);
					break;
			}
		}
	}

	spawnNotification(notification: Notification) {
		store.commit('incrementNotificationCount', 1);

		const message = getNotificationText(notification);
		const icon =
			notification.from_model === undefined ? '' : notification.from_model.img_avatar;

		if (message !== undefined) {
			Growls.info({
				message,
				title: Translate.$gettext('New Notification'),
				icon,
				onclick: () => notification.go(router),
			});
		} else {
			// received a notification that cannot be parsed properly...
			Growls.info({
				message: Translate.$gettext('You have a new notification.'),
				title: Translate.$gettext('New Notification'),
				icon: undefined,
				onclick: () => router.push('/notifications'),
			});
		}
	}

	disconnect() {
		if (this.connected) {
			console.log('[Grid] Disconnecting...');

			this.connected = false;
			this.channels.forEach(channel => {
				channel.leave();
				if (this.socket !== null) {
					this.socket.remove(channel);
				}
			});
			this.channels = [];
			if (this.socket !== null) {
				this.socket.disconnect();
				this.socket = null;
			}
		}
	}
}
