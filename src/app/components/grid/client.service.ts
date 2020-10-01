import Axios from 'axios';
import { Channel, Socket } from 'phoenix';
import { arrayRemove } from '../../../utils/array';
import { TabLeader } from '../../../utils/tab-leader';
import { sleep } from '../../../utils/utils';
import { uuidv4 } from '../../../utils/uuid';
import { Analytics } from '../../../_common/analytics/analytics.service';
import { Community } from '../../../_common/community/community.model';
import { getCookie } from '../../../_common/cookie/cookie.service';
import { Environment } from '../../../_common/environment/environment.service';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import { GameTrophy } from '../../../_common/game/trophy/trophy.model';
import { Growls } from '../../../_common/growls/growls.service';
import { Notification } from '../../../_common/notification/notification-model';
import { NotificationText } from '../../../_common/notification/notification-text.service';
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

interface CommunityBootstrapPayload {
	status: string;
	community_id: string;
	body: {
		unreadChannels: number[];
		unreadFeatured: boolean;
	};
}

type ClearNotificationsType =
	// For the user's activity feed.
	| 'activity'
	// For the user's notification feed.
	| 'notifications'
	// For the "hasUnreadPosts" state in communities the user has not viewed yet.
	| 'community-unread'
	// For the frontpage of featured posts.
	| 'community-featured'
	// For an individual community channel.
	| 'community-channel'
	| 'friend-requests';

interface ClearNotificationsPayload {
	type: ClearNotificationsType;
	data: any;
	clientId: string;
}

export interface ClearNotificationsEventData extends ClearNotificationsPayload {
	currentCount: number;
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
			const sleepMs = Math.min(
				30000 + Math.random() * 10000,
				Math.random() * delay * 1000 + 1000
			);
			console.error(`[Grid] Failed request [${context}]. Reattempt in ${sleepMs} ms.`);
			await sleep(sleepMs);
		}

		delay++;
	}

	return result;
}

export class GridClient {
	// Stores a unique id that identifies this session when it pushes data to Grid.
	readonly clientId = uuidv4();

	connected = false;
	socket: Socket | null = null;
	channels: Channel[] = [];
	notificationBacklog: NewNotificationPayload[] = [];
	bootstrapReceived = false;
	bootstrapTimestamp = 0;
	bootstrapDelay = 1;
	notificationChannel: Channel | null = null;
	tabLeader: TabLeader | null = null;

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
			Axios.get(Environment.gridHost, { ignoreLoadingBar: true, timeout: 3000 })
		);
		const host = `${hostResult.data}/grid/socket`;

		console.log('[Grid] Server selected:', host);

		// heartbeat is 30 seconds, backend disconnects after 40 seconds
		this.socket = new Socket(host, {
			heartbeatIntervalMs: 30000,
		});

		// HACK
		// there is no built in way to stop a Phoenix socket from attempting to reconnect on its own after it got disconnected.
		// this replaces the socket's "reconnectTimer" property with an empty object that matches the Phoenix "Timer" signature
		// The 'reconnectTimer' usually restarts the connection after a delay, this prevents that from happening
		const socketAny: any = this.socket;
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

		const userId = user.id.toString();
		const channel = this.socket.channel('notifications:' + userId, {
			frontend_cookie: cookie,
		});
		this.notificationChannel = channel;

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

		// After successfully connecting to the socket, elect leader.
		if (this.tabLeader !== null) {
			await this.tabLeader.kill();
		}
		this.tabLeader = new TabLeader('grid_notification_channel');
		this.tabLeader.init();

		channel.on('new-notification', (payload: NewNotificationPayload) =>
			this.handleNotification(payload)
		);

		channel.on('bootstrap', (payload: BootstrapPayload) => {
			this.handleBootstrap(channel, payload);
		});

		channel.push('request-bootstrap', { user_id: userId });

		channel.on('clear-notifications', (payload: ClearNotificationsPayload) => {
			this.handleClearNotifications(payload);
		});

		channel.on('community-bootstrap', (payload: CommunityBootstrapPayload) => {
			this.handleCommunityBootstrap(payload);
		});

		this.joinCommunities();
	}

	async restart(sleepMs = 2000) {
		// sleep a bit before trying to reconnect
		await sleep(sleepMs);
		// teardown and try to reconnect
		if (this.connected) {
			await this.disconnect();
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

			// communities - has unread posts?
			// When bootstrapping grid, we only get a list of communities and we don't
			// care which channels in them are unread, just if it has any unread posts in them.
			// when navigating into the community itself - this flag is cleared and the actual counts
			// for the channels are populated.
			for (const communityId of payload.body.unreadCommunities) {
				const communityState = store.state.communityStates.getCommunityState(communityId);
				if (!communityState.routeBootstrapped) {
					communityState.hasUnreadPosts = true;
				}
			}

			// Reset delay when the bootstrap went through successfully.
			this.bootstrapDelay = 1;
		} else {
			// error
			console.log(`[Grid] Failed to fetch notification count bootstrap (${payload.body}).`);

			const delay = Math.min(
				30000 + Math.random() * 10000,
				Math.random() * this.bootstrapDelay * 2000 + 1000
			);
			this.bootstrapDelay++;

			console.log(`[Grid] Reconnect in ${delay}ms...`);

			this.restart(delay);
		}
	}

	handleCommunityBootstrap(payload: CommunityBootstrapPayload) {
		const communityId = Number.parseInt(payload.community_id, 10);
		const communityState = store.state.communityStates.getCommunityState(communityId);

		// This flag was set to true in the main bootstrap and we need to unset it
		// now that we have the actual unread channels in this community.
		// read comment in client service for more info.
		communityState.hasUnreadPosts = false;
		communityState.routeBootstrapped = true;

		communityState.hasUnreadFeaturedPosts = payload.body.unreadFeatured;
		for (const channelId of payload.body.unreadChannels) {
			communityState.markChannelUnread(channelId);
		}
	}

	handleClearNotifications(payload: ClearNotificationsPayload) {
		// Don't do anything when the notification originated from this client.
		if (payload.clientId === this.clientId) {
			return;
		}

		switch (payload.type) {
			case 'activity':
				store.commit('setNotificationCount', {
					type: 'activity',
					count: 0,
				});
				break;
			case 'notifications':
				store.commit('setNotificationCount', {
					type: 'notifications',
					count: 0,
				});
				break;
			case 'community-channel':
				{
					const communityChannelId = payload.data.channelId as number;
					const communityId = payload.data.communityId as number;
					const communityState = store.state.communityStates.getCommunityState(
						communityId
					);
					communityState.markChannelRead(communityChannelId);
				}
				break;
			case 'community-featured':
				{
					const communityId = payload.data.communityId as number;
					const communityState = store.state.communityStates.getCommunityState(
						communityId
					);
					communityState.hasUnreadFeaturedPosts = false;
				}
				break;
			case 'community-unread':
				{
					const communityId = payload.data.communityId as number;
					const communityState = store.state.communityStates.getCommunityState(
						communityId
					);
					communityState.hasUnreadPosts = false;
				}
				break;
			case 'friend-requests':
				// This event gets fired every time the user accepts/rejects a friendship.
				// The only action we need to take here is to decrease the global friendship number by 1.
				// No component needs to react to this change currently, so there is no need for an event bus emit.
				store.commit('changeFriendRequestCount', -1);
				break;
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

		let message = NotificationText.getText(notification, true);
		let icon = notification.from_model === undefined ? '' : notification.from_model.img_avatar;

		// When it's a game post as game owner, use the game owner's avatar instead.
		if (
			notification.action_model instanceof FiresidePost &&
			notification.action_model.as_game_owner &&
			!!notification.action_model.game
		) {
			icon = notification.action_model.game.developer.img_avatar;
		}

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
				system: this.tabLeader?.isLeader || true,
			});
		} else {
			// Received a notification that cannot be parsed properly...
			Growls.info({
				title: Translate.$gettext('New Notification'),
				message: Translate.$gettext('You have a new notification.'),
				icon: undefined,
				onclick: () => {
					Analytics.trackEvent('grid', 'notification-click', notification.type);
					router.push('/notifications');
				},
				system: this.tabLeader?.isLeader || true,
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
		communityState.hasUnreadFeaturedPosts = true;

		store.commit('incrementNotificationCount', { count: 1, type: 'activity' });
	}

	handleCommunityNewPost(communityId: number, payload: CommunityNewPostPayload) {
		const channelId = Number.parseInt(payload.channel_id, 10);
		const communityState = store.state.communityStates.getCommunityState(communityId);
		communityState.markChannelUnread(channelId);
	}

	leaveChannel(channel: Channel) {
		channel.leave();
		if (this.socket !== null) {
			this.socket.remove(channel);
		}
	}

	async disconnect() {
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
			this.notificationChannel = null;
			if (this.socket !== null) {
				this.socket.disconnect();
				this.socket = null;
			}

			if (this.tabLeader !== null) {
				await this.tabLeader.kill();
			}
		}
	}

	public recordFeaturedPost(post: FiresidePost) {
		if (!this.featuredPostIds.has(post.id)) {
			this.featuredPostIds.add(post.id);
		}
	}

	public async pushViewNotifications(type: ClearNotificationsType, data: any = {}) {
		// Don't do anything for guests, they aren't connected to Grid.
		if (store.state.app.user === null) {
			return;
		}

		// This can get invoked before grid is up and running, so wait here until it is.
		// That can mainly happen when the route-resolve for a page clears notifications.
		// For example: main feed page clears notifications in backend as the route loads,
		// but grid is not loaded yet.
		while (!this.connected) {
			await sleep(250);
		}

		if (this.notificationChannel) {
			this.notificationChannel.push('view-notifications', {
				type,
				data,
				clientId: this.clientId,
			});
		}
	}

	public async queueRequestCommunityBootstrap(communityId: number) {
		// Don't do anything for guests, they aren't connected to Grid.
		if (store.state.app.user === null) {
			return;
		}

		while (!this.connected) {
			await sleep(250);
		}

		if (this.notificationChannel) {
			this.notificationChannel.push('request-community-bootstrap', {
				user_id: store.state.app.user.id.toString(),
				community_id: communityId.toString(),
			});
		}
	}
}
