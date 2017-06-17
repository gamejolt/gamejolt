import { ChatMessage } from '../message';
import { store } from '../../../store/index';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { Settings } from '../../settings/settings.service';
import { ChatUser } from '../user';
import { Translate } from '../../../../lib/gj-lib-client/components/translate/translate.service';

/**
 * How long to wait before showing the friend online/offline message. This
 * allows us to not flash online/offline messages when they refresh browser.
 */
const FriendConnectionWait = 8000;

export class ChatNotification {
	private static friendConnectionTimers: { [k: number]: NodeJS.Timer } = {};
	private static friendConnectionStates: { [k: number]: boolean } = {};

	private static get chat() {
		return store.state.chat!;
	}

	static notification(message: ChatMessage) {
		if (!this.chat.room || !this.chat.openRooms[message.roomId]) {
			Growls.info({
				title: message.user.displayName,
				message: message.contentRaw, // Use the raw message so we don't show compiled markdown.
				icon: message.user.imgAvatar,
				onclick: () => {
					this.chat.enterRoom(message.roomId, true);
				},
			});
		}
	}

	static friendOnline(userId: number) {
		if (!Settings.get('chat-notify-friends-online')) {
			return;
		}

		this.queueFriendConnection(userId, true, friend => {
			Growls.info({
				title: Translate.$gettextInterpolate(`%{ user } Online`, {
					user: friend.displayName,
				}),
				message: Translate.$gettextInterpolate(`%{ user } just got online`, {
					user: friend.displayName,
				}),
				icon: friend.imgAvatar,
				onclick: () => {
					this.chat.enterRoom(friend.roomId, true);
				},
			});
		});
	}

	static friendOffline(userId: number) {
		if (!Settings.get('chat-notify-friends-online')) {
			return;
		}

		this.queueFriendConnection(userId, false, friend => {
			Growls.info({
				title: Translate.$gettextInterpolate(`%{ user } Offline`, {
					user: friend.displayName,
				}),
				message: Translate.$gettextInterpolate(`%{ user } just went offline.`, {
					user: friend.displayName,
				}),
				icon: friend.imgAvatar,
				onclick: () => {
					this.chat.enterRoom(friend.roomId, true);
				},
			});
		});
	}

	private static queueFriendConnection(
		userId: number,
		isOnline: boolean,
		fn: (friend: ChatUser) => void
	) {
		const friend = this.chat.friendsList.get(userId);
		if (!friend) {
			return;
		}

		// We store the new state of the friend before doing the whole promise chain.
		if (typeof this.friendConnectionStates[userId] === 'undefined') {
			this.friendConnectionStates[userId] = isOnline;
		}

		const timer = this.friendConnectionTimers[userId];
		if (timer) {
			clearTimeout(timer);
			delete this.friendConnectionTimers[userId];
		}

		this.friendConnectionTimers[userId] = setTimeout(() => {
			// We only alert if the new state is the same as the one we had
			// wanted to alert on at the beginning of the chain. This way if
			// they are offline, then quickly online -> offline, we don't alert
			// since we had tried to go online, but then we changed to offline,
			// which is a different state than we had initially tried to
			// transition to.
			if (this.friendConnectionStates[userId] === isOnline) {
				fn(friend);
			}

			delete this.friendConnectionTimers[userId];
			delete this.friendConnectionStates[userId];
		}, FriendConnectionWait);
	}
}
