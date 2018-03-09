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
import { Analytics } from '../../../lib/gj-lib-client/components/analytics/analytics.service';
import { Settings } from '../../../_common/settings/settings.service';

interface NewNotificationPayload {
	notification_data: {
		event_item: any;
	};
}

interface BootstrapPayload {
	status: string;
	body: {
		friendRequestCount: number;
		lastNotificationTime: number;
		notificationCount: number;
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
	notificationBacklog: NewNotificationPayload[] = [];
	bootstrapReceived = false;
	bootstrapTimestamp = 0;

	constructor() {
		this.connect();
	}

	private async connect() {
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
		const host = `${hostResult.data}/grid/socket`;

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

		channel.on('bootstrap', (payload: BootstrapPayload) => {
			if (payload.status === 'ok') {
				console.log('[Grid] Received notification count bootstrap.');

				channel.onError(reason => {
					console.log(`[Grid] Connection error encountered (Reason: ${reason}).`);
					this.restart(0);
				});

				store.commit('setNotificationCount', payload.body.notificationCount);
				store.commit('setFriendRequestCount', payload.body.friendRequestCount);
				this.bootstrapTimestamp = payload.body.lastNotificationTime;

				this.bootstrapReceived = true;

				// handle backlog
				for (const notification of this.notificationBacklog) {
					this.handleNotification(notification);
				}
				this.notificationBacklog = [];
			} else {
				// error
				console.log(
					`[Grid] Failed to fetch notification count bootstrap (${payload.body}).`
				);
				this.restart();
			}
		});

		channel.push('request-bootstrap', { user_id: userId });
	}

	async restart(sleepMs: number = 2000) {
		// sleep a bit before trying to reconnect
		await sleep(sleepMs);
		// teardown and try to reconnect
		if (this.connected) {
			this.disconnect();
			this.connect();
		}
	}

	handleNotification(payload: NewNotificationPayload) {
		if (this.connected) {
			// if no bootstrap has been received yet, store new notifications in a backlog to process them later
			// the bootstrap delivers the timestamp of the last event item included in the bootstrap's notification count
			// all event notifications received before the timestamp from the bootstrap will be ignored
			if (!this.bootstrapReceived) {
				this.notificationBacklog.push(payload);
			} else {
				const data = payload.notification_data.event_item;
				const notification = new Notification(data);

				// only handle if timestamp is newer than the bootstrap timestamp
				if (notification.added_on > this.bootstrapTimestamp) {
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
		}
	}

	spawnNotification(notification: Notification) {
		store.commit('incrementNotificationCount', 1);

		// In Client when the feed notifications setting is disabled, don't show them notifications.
		// On site we only use it to disable native browser notifications, but still try to show in
		// the Growl.
		if (GJ_IS_CLIENT && !Settings.get('feed-notifications')) {
			return;
		}

		const message = getNotificationText(notification);
		const icon =
			notification.from_model === undefined ? '' : notification.from_model.img_avatar;

		if (message !== undefined) {
			let title = Translate.$gettext('New Notification');
			if (notification.type === Notification.TYPE_DEVLOG_POST_ADD) {
				title = Translate.$gettext('New Post');
			} else if (notification.type === Notification.TYPE_COMMENT_VIDEO_ADD) {
				title = Translate.$gettext('New Video');
			}

			Growls.info({
				title,
				message,
				icon,
				onclick: () => {
					Analytics.trackEvent('grid', 'notification-click', notification.type);
					notification.go(router);
				},
				system: true,
			});
		} else {
			// received a notification that cannot be parsed properly...
			Growls.info({
				title: Translate.$gettext('New Notification'),
				message: Translate.$gettext('You have a new notification.'),
				icon: undefined,
				onclick: () => {
					Analytics.trackEvent('grid', 'notification-click', notification.type);
					router.push('/notifications');
				},
				system: true,
			});
		}
	}

	disconnect() {
		if (this.connected) {
			console.log('[Grid] Disconnecting...');

			this.connected = false;
			this.bootstrapReceived = false;
			this.notificationBacklog = [];
			this.bootstrapTimestamp = 0;
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
