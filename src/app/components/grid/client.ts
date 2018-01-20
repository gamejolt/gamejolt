import { Socket, Channel } from 'phoenix';
import { Growls } from '../../../lib/gj-lib-client/components/growls/growls.service';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { store } from '../../store/index';
import { getCookie } from '../../../_common/cookie/cookie.service';
import {
	Notification,
	getNotificationText,
} from '../../../lib/gj-lib-client/components/notification/notification-model';

export class GridClient {
	connected = false;
	socket: Socket | null = null;
	channels: Channel[] = [];

	constructor() {
		this._init();
	}

	private async _init() {
		if (GJ_IS_SSR) {
			return;
		}

		const cookie = await getCookie('frontend');
		const user = store.state.app.user;

		if (user === null || cookie === undefined) {
			// not properly logged in
			return;
		}

		console.log('Connecting to the Grid!');

		const userId = user.id.toString();

		this.socket = new Socket(Environment.gridHost);
		this.socket.connect({
			frontend_cookie: cookie,
			user_id: userId,
		});

		const channel = this.socket.channel('notifications:' + userId, {
			frontend_cookie: cookie,
		});

		channel
			.join()
			.receive('error', () => console.log('Failed to connect to Grid!'))
			.receive('ok', () => {
				if (!this.connected) {
					this.connected = true;
					this.channels.push(channel);
					console.log('User joined notifications channel.');
				}
			});

		channel.on('new-notification', payload => {
			this.spawnNewNotification(payload.notification_data);
		});
	}

	spawnNewNotification(notificationData: any) {
		if (this.connected) {
			const data = notificationData.event_item;
			const notification = new Notification(data);
			const message = getNotificationText(notification);
			const icon =
				notification.from_model === undefined ? '' : notification.from_model.img_avatar;

			Growls.info({
				message: message,
				title: 'New Notification',
				icon: icon,
				onclick: notification.go,
			});
		}
	}

	disconnect() {
		this.connected = false;
		this.channels.forEach(channel => {
			channel.leave();
		});
		this.channels = [];
		if (this.socket !== null) {
			this.socket.disconnect();
		}
	}
}
