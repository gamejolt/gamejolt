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
 * @param context Context for logging when the request fails
 * @param request The promise containing the request. Throw to fail
 */
async function pollRequest(context: string, request: Promise<any>): Promise<any> {
	let result = null;
	let finished = false;

	let delay = 1;

	while (!finished) {
		try {
			result = await request;
			finished = true;
		} catch (e) {
			const sleepMs = Math.random() * (delay * 1000);
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
		this.init();
	}

	private async init() {
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
		console.log('[Grid] Selecting server...');

		// get hostname from loadbalancer first
		const hostResult = await pollRequest('Get host', Axios.get(Environment.gridHost));
		const host = `ws://${hostResult.data}/socket`;

		console.log('[Grid] Server selected:', host);

		const userId = user.id.toString();

		this.socket = new Socket(host, {
			params: {
				frontend_cookie: cookie,
				user_id: userId,
			},
		});

		await pollRequest(
			'Connect to socket',
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

		console.log('[Grid] User joined notifications channel.');

		channel.on('new-notification', (payload: NewNotificationPayload) =>
			this.spawnNewNotification(payload)
		);
	}

	spawnNewNotification(payload: NewNotificationPayload) {
		if (this.connected) {
			// increment the notification counter by 1.
			store.commit('incrementNotificationCount', 1);

			const data = payload.notification_data.event_item;
			const notification = new Notification(data);
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
					message:
						'You received a new notification. Click here to view your notification feed.',
					title: Translate.$gettext('New Notification'),
					icon: undefined,
					onclick: () => router.push('/notifications'),
				});
			}
		}
	}

	disconnect() {
		if (this.connected) {
			console.log('[Grid] Disconnecting...');

			this.connected = false;
			this.channels.forEach(channel => channel.leave());
			this.channels = [];
			if (this.socket !== null) {
				this.socket.disconnect();
			}
		}
	}
}
