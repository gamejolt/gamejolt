import Axios from 'axios';
import { Channel, Socket } from 'phoenix';
import { arrayRemove } from '../../../utils/array';
import { sleep } from '../../../utils/utils';
import { Analytics } from '../../../_common/analytics/analytics.service';
import { Community } from '../../../_common/community/community.model';
import { getCookie } from '../../../_common/cookie/cookie.service';
import { Environment } from '../../../_common/environment/environment.service';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import { GameTrophy } from '../../../_common/game/trophy/trophy.model';
import { Growls } from '../../../_common/growls/growls.service';
import {
	getNotificationText,
	Notification,
} from '../../../_common/notification/notification-model';
import { Settings } from '../../../_common/settings/settings.service';
import { SiteTrophy } from '../../../_common/site/trophy/trophy.model';
import { Translate } from '../../../_common/translate/translate.service';
import { UserGameTrophy } from '../../../_common/user/trophy/game-trophy.model';
import { UserSiteTrophy } from '../../../_common/user/trophy/site-trophy.model';
import { User } from '../../../_common/user/user.model';
import { store } from '../../store/index';
import { router } from '../../views';
import { getTrophyImg } from '../trophy/thumbnail/thumbnail';
import { CommunityChannel } from './community-channel';
import { PostChannel } from './post-channel';

interface NewNotificationPayload {
	notification_data: {
		event_item: any;
	};
}

interface CommunityFeaturePayload {
	post_id: string;
}

interface CommunityNewPostPayload {
	channel_id: string;
}

interface BootstrapPayload {
	status: string;
	body: {
		friendRequestCount: number;
		lastNotificationTime: number;
		notificationCount: number;
		activityUnreadCount: number;
		notificationUnreadCount: number;
		unreadFeaturedCommunities: { [communityId: number]: number };
		unreadCommunities: number[];
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

	/**
	 * Store ids of posts the user has featured.
	 * The Grid client will ignore any incoming feature notifications for posts recorded here,
	 * because users that feature posts should not get notified about those exact posts.
	 */
	private featuredPostIds: Set<number> = new Set<number>();

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
			Axios.get(Environment.gridHost, { ignoreLoadingBar: true })
		);
		const host = `${hostResult.data}/grid/socket`;

		console.log('[Grid] Server selected:', host);

		const userId = user.id.toString();

		// heartbeat is 30 seconds, backend disconnects after 40 seconds
		this.socket = new Socket(host, {
			heartbeatIntervalMs: 30000,
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
			this.handleBootstrap(channel, payload);
		});

		channel.push('request-bootstrap', { user_id: userId });

		this.joinCommunities();
	}

	async restart(sleepMs = 2000) {
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

	handleBootstrap(channel: Channel, payload: BootstrapPayload) {
		if (payload.status === 'ok') {
			console.log('[Grid] Received bootstrap.');

			channel.onError(reason => {
				console.log(`[Grid] Connection error encountered (Reason: ${reason}).`);
				this.restart(0);
			});

			store.commit('setNotificationCount', {
				type: 'activity',
				count: payload.body.activityUnreadCount,
			});
			store.commit('setNotificationCount', {
				type: 'notifications',
				count: payload.body.notificationUnreadCount,
			});

			store.commit('setFriendRequestCount', payload.body.friendRequestCount);
			this.bootstrapTimestamp = payload.body.lastNotificationTime;

			this.bootstrapReceived = true;

			// handle backlog
			for (const notification of this.notificationBacklog) {
				this.handleNotification(notification);
			}
			this.notificationBacklog = [];

			// communities - unread featured counts
			const unreadFeatured = payload.body.unreadFeaturedCommunities;
			for (const communityIdStr in unreadFeatured) {
				const communityId = parseInt(communityIdStr, 10);

				const communityState = store.state.communityStates.getCommunityState(communityId);
				communityState.unreadFeatureCount = unreadFeatured[communityId] || 0;
			}

			// communities - has unread posts?
			// When bootstrapping grid, we only get a list of communities and we don't
			// care which channels in them are unread, just if it has any unread posts in them.
			// when navigating into the community itself - this flag is cleared and the actual counts
			// for the channels are populated.
			for (const communityId of payload.body.unreadCommunities) {
				const communityState = store.state.communityStates.getCommunityState(communityId);
				communityState.hasUnreadPosts = true;
			}
		} else {
			// error
			console.log(`[Grid] Failed to fetch notification count bootstrap (${payload.body}).`);
			this.restart();
		}
	}

	spawnNotification(notification: Notification) {
		const feedType = notification.feedType;
		if (feedType !== '') {
			store.commit('incrementNotificationCount', { count: 1, type: feedType });
		}

		// In Client when the feed notifications setting is disabled, don't show them notifications.
		// On site we only use it to disable native browser notifications, but still try to show in
		// the Growl.
		if (GJ_IS_CLIENT && !Settings.get('feed-notifications')) {
			return;
		}

		let message = getNotificationText(notification, true);
		let icon = notification.from_model === undefined ? '' : notification.from_model.img_avatar;

		if (message !== undefined) {
			let title = Translate.$gettext('New Notification');
			if (notification.type === Notification.TYPE_POST_ADD) {
				if (notification.from_model instanceof User) {
					title = Translate.$gettextInterpolate(`New Post by @%{ username }`, {
						username: notification.from_model.username,
					});
				} else {
					title = Translate.$gettext('New Post');
				}
			} else if (notification.type === Notification.TYPE_COMMENT_VIDEO_ADD) {
				if (notification.from_model instanceof User) {
					title = Translate.$gettextInterpolate(`New Video by @%{ username }`, {
						username: notification.from_model.username,
					});
				} else {
					title = Translate.$gettext('New Video');
				}
			} else if (notification.type === Notification.TYPE_GAME_TROPHY_ACHIEVED) {
				if (
					notification.action_model instanceof UserGameTrophy &&
					notification.action_model.trophy instanceof GameTrophy
				) {
					title = Translate.$gettext(`Trophy Unlocked!`);
					message = notification.action_model.trophy.title;
					icon = getTrophyImg(notification.action_model.trophy);
				}
			} else if (notification.type === Notification.TYPE_SITE_TROPHY_ACHIEVED) {
				if (
					notification.action_model instanceof UserSiteTrophy &&
					notification.action_model.trophy instanceof SiteTrophy
				) {
					title = Translate.$gettext(`Trophy Unlocked!`);
					message = notification.action_model.trophy.title;
					icon = getTrophyImg(notification.action_model.trophy);
				}
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

	async joinCommunities() {
		console.log('[Grid] Subscribing to community channels...');

		for (const community of store.state.communities) {
			this.joinCommunity(community);
		}
	}

	async joinCommunity(community: Community) {
		const cookie = await getCookie('frontend');
		const user = store.state.app.user;
		if (this.socket && user && cookie) {
			const userId = user.id.toString();

			const channel = new CommunityChannel(community, this.socket, {
				frontend_cookie: cookie,
				user_id: userId,
			});

			await pollRequest(
				`Join community channel '${community.name}' (${community.id})`,
				() =>
					new Promise((resolve, reject) => {
						channel
							.join()
							.receive('error', reject)
							.receive('ok', () => {
								this.channels.push(channel);
								resolve();
							});
					})
			);

			channel.on('feature', (payload: CommunityFeaturePayload) =>
				this.handleCommunityFeature(community.id, payload)
			);
			channel.on('new-post', (payload: CommunityNewPostPayload) =>
				this.handleCommunityNewPost(community.id, payload)
			);
		}
	}

	async leaveCommunity(community: Community) {
		const channel = this.channels.find(
			c => c instanceof CommunityChannel && c.community.id === community.id
		);
		if (channel) {
			this.leaveChannel(channel);
			arrayRemove(this.channels, c => c === channel);
		}
	}

	handleCommunityFeature(communityId: number, payload: CommunityFeaturePayload) {
		// Suppress notification if the user featured that post.
		if (payload.post_id) {
			const postId = Number.parseInt(payload.post_id, 10);
			if (this.featuredPostIds.has(postId)) {
				return;
			}
		}

		const communityState = store.state.communityStates.getCommunityState(communityId);
		communityState.unreadFeatureCount++;
		store.commit('incrementNotificationCount', { count: 1, type: 'activity' });
	}

	handleCommunityNewPost(communityId: number, payload: CommunityNewPostPayload) {
		const channelId = Number.parseInt(payload.channel_id, 10);
		const communityState = store.state.communityStates.getCommunityState(communityId);
		communityState.markChannelUnread(channelId);
	}

	async startListenPost(post: FiresidePost, handler: (event: string, response: any) => void) {
		const cookie = await getCookie('frontend');
		const user = store.state.app.user;

		if (this.socket && user && cookie) {
			const userId = user.id.toString();

			const channel = new PostChannel(post, this.socket, {
				frontend_cookie: cookie,
				user_id: userId,
			});

			await pollRequest(
				`Join post ${post.id} channel`,
				() =>
					new Promise((resolve, reject) => {
						channel
							.join()
							.receive('error', reject)
							.receive('ok', () => {
								this.channels.push(channel);
								resolve();
							});
					})
			);

			channel.on('poll-vote', (payload: any) => handler('poll-vote', payload));
			channel.on('like', (payload: any) => handler('like', payload));
			channel.on('unlike', (payload: any) => handler('unlike', payload));
		}
	}

	async stopListenPost(post: FiresidePost) {
		const channel = this.channels.find(i => i instanceof PostChannel && i.post.id === post.id);
		if (channel) {
			this.leaveChannel(channel);
			arrayRemove(this.channels, c => c === channel);
		}
	}

	leaveChannel(channel: Channel) {
		channel.leave();
		if (this.socket !== null) {
			this.socket.remove(channel);
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
				this.leaveChannel(channel);
			});
			this.channels = [];
			if (this.socket !== null) {
				this.socket.disconnect();
				this.socket = null;
			}
		}
	}

	public recordFeaturedPost(post: FiresidePost) {
		if (!this.featuredPostIds.has(post.id)) {
			this.featuredPostIds.add(post.id);
		}
	}
}
