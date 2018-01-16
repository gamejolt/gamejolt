import { Socket, Channel } from 'phoenix';
import { Growls } from '../../../lib/gj-lib-client/components/growls/growls.service';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import * as nwGui from 'nw.gui';
import { store } from '../../store/index';

function getCookie(name: string): Promise<string | undefined> {
	return new Promise(resolve => {
		// Within Client we have to access it connectedthis way.
		if (GJ_IS_CLIENT) {
			const gui = require('nw.gui') as typeof nwGui;
			const win = gui.Window.get();
			(win as any).cookies.get(
				{
					url: 'game-jolt-client',
					name: name,
				},
				(cookieData: any) => {
					if (!cookieData) {
						return resolve(undefined);
					}
					return resolve(cookieData.value);
				}
			);
		} else {
			let i,
				x,
				y,
				ARRcookies = document.cookie.split(';');
			for (i = 0; i < ARRcookies.length; i++) {
				x = ARRcookies[i].substr(0, ARRcookies[i].indexOf('='));
				y = ARRcookies[i].substr(ARRcookies[i].indexOf('=') + 1);
				x = x.replace(/^\s+|\s+$/g, '');
				if (x === name) {
					return resolve(decodeURI(y));
				}
			}
			return resolve(undefined);
		}
	});
}

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

		channel.on('new_notification', payload => {
			this.spawnNewNotification(payload.notification_data);
		});
	}

	spawnNewNotification(notificationData: any) {
		if (this.connected) {
			Growls.info({
				message: notificationData.message,
				title: notificationData.title,
				icon: 'https://i.imgur.com/035u64t.png',
				onclick: () => {
					window.location.href = Environment.baseUrl + notificationData.url;
				},
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
