import { computed, reactive, shallowReadonly } from 'vue';
import { TabLeaderInterface } from '../../../utils/tab-leader';
import { importNoSSR } from '../../../_common/code-splitting';
import { configHomeDefaultFeed } from '../../../_common/config/config.service';
import { FiresidePostGotoGrowl } from '../../../_common/fireside/post/goto-growl/goto-growl.service';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import { Notification } from '../../../_common/notification/notification-model';
import { QuestNotification } from '../../../_common/quest/quest-notification-model';
import { createSocketChannelController } from '../../../_common/socket/socket-controller';
import { HOME_FEED_FYP } from '../../views/home/home-feed.service';
import { GridClient, onFiresideStart, onNewStickers } from './client.service';

const TabLeaderLazy = importNoSSR(async () => await import('../../../utils/tab-leader'));

export type GridNotificationChannel = Awaited<ReturnType<typeof createGridNotificationChannel>>;

interface JoinPayload {
	hasNewFriendRequests: boolean;
	lastNotificationTime: number;
	notificationCount: number;
	activityUnreadCount: number;
	activityUnreadCounts: { [countId: string]: number };
	notificationUnreadCount: number;
	unreadFeaturedCommunities: { [communityId: number]: number };
	unreadCommunities: number[];
	hasNewUnlockedStickers: boolean;
	newQuestIds: number[];
	questActivityIds: number[];
	questResetHour: number;
}

interface NewNotificationPayload {
	notification_data: {
		event_item: any;
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
	| 'friend-requests'
	// For the user's unviewed automatically unlocked stickers.
	| 'stickers'
	// A quest became available and is ready to be accepted.
	| 'new-quest'
	// A quest has updated progress or rewards available to claim.
	| 'quest-activity';

interface ClearNotificationsPayload {
	type: ClearNotificationsType;
	data: ClearNotificationsData;
	clientId: string;
}

interface ClearNotificationsData {
	channelId?: number;
	communityId?: number;
	questId?: number;
}

interface StickerUnlockPayload {
	sticker_img_urls: string[];
}

interface PostUpdatedPayload {
	post_id: number;
	/** Contains payload data for a `FiresidePost` resource. */
	post_data: any;
	/** `true` when the post was just published in the chain of events. */
	was_published: boolean;
	/** (Only set when `was_published` is true) Indicate whether this post was scheduled before it was automatically published. */
	was_scheduled: boolean;
}

export async function createGridNotificationChannel(
	client: GridClient,
	options: { userId: number }
) {
	const { socketController, appStore } = client;
	const { userId } = options;
	const { communityStates } = appStore;

	let _tabLeader: TabLeaderInterface | null = null;
	const isTabLeader = computed(() => _tabLeader?.isLeader ?? false);

	const channelController = createSocketChannelController(
		`notifications:${userId}`,
		socketController
	);

	channelController.listenTo('new-notification', _onNewNotification);
	channelController.listenTo('clear-notifications', _onClearNotifications);
	channelController.listenTo('sticker-unlock', _onStickerUnlock);
	channelController.listenTo('post-updated', _onPostUpdated);

	const c = shallowReadonly({
		channelController,
		userId,
		isTabLeader,
		pushViewNotifications,
		pushCommunityBootstrap,
	});

	await channelController.join({
		async onJoin(payload: JoinPayload) {
			const { TabLeader } = await TabLeaderLazy;
			_tabLeader = new TabLeader('grid_notification_channel_' + userId);
			_tabLeader.init();

			let activityUnreadCount = payload.activityUnreadCount;

			// If the FYP feed is the default feed, community feature items will
			// not be returned in the home feed. Only show new-counts from posts
			// of sources the user follows.
			if (configHomeDefaultFeed.value === HOME_FEED_FYP) {
				activityUnreadCount = payload.activityUnreadCounts['following'];
			}

			appStore.setNotificationCount({
				type: 'activity',
				count: activityUnreadCount,
			});
			appStore.setNotificationCount({
				type: 'notifications',
				count: payload.notificationUnreadCount,
			});

			appStore.setHasNewFriendRequests(payload.hasNewFriendRequests);
			appStore.setHasNewUnlockedStickers(payload.hasNewUnlockedStickers);
			appStore.setHasNewUnlockedStickers(payload.hasNewUnlockedStickers);

			const questStore = appStore.getQuestStore();
			questStore.addNewQuestIds(payload.newQuestIds);
			questStore.addQuestActivityIds(payload.questActivityIds);
			questStore.setDailyResetHour(payload.questResetHour);

			client.bootstrapTimestamp = payload.lastNotificationTime;
			client.bootstrapReceived = true;

			// communities - has unread posts?
			//
			// When bootstrapping grid, we only get a list of communities and we
			// don't care which channels in them are unread, just if it has any
			// unread posts in them. when navigating into the community itself -
			// this flag is cleared and the actual counts for the channels are
			// populated.
			for (const communityId of payload.unreadCommunities) {
				const communityState = communityStates.value.getCommunityState(communityId);

				if (!communityState.dataBootstrapped) {
					communityState.hasUnreadPosts = true;
				}
			}

			// Reset delay when the bootstrap went through successfully.
			client.bootstrapDelay = 1;

			// If we are viewing a community, call its bootstrap as well:
			if (client.viewingCommunityId) {
				const communityState = communityStates.value.getCommunityState(
					client.viewingCommunityId
				);
				if (!communityState || !communityState.dataBootstrapped) {
					client.queueRequestCommunityBootstrap(client.viewingCommunityId);
				}
			}
		},

		onLeave() {
			_tabLeader?.kill();
		},
	});

	function _onNewNotification(payload: NewNotificationPayload) {
		const data = payload.notification_data.event_item;
		const notification = reactive(new Notification(data)) as Notification;

		switch (notification.type) {
			case Notification.TYPE_FRIENDSHIP_REQUEST:
				// For an incoming friend request, set that they have a new friend request.
				appStore.setHasNewFriendRequests(true);
				client.spawnNotification(notification);
				break;

			case Notification.TYPE_FIRESIDE_START:
				// Emit event that different components can pick up to update their views.
				onFiresideStart.next(notification.action_model);
				client.spawnNotification(notification);
				break;

			case Notification.TYPE_QUEST_NOTIFICATION: {
				if (!(notification.action_model instanceof QuestNotification)) {
					break;
				}

				const questStore = appStore.getQuestStore();
				const model = notification.action_model;
				if (model.is_new) {
					questStore.addNewQuestIds([model.quest_id]);
				}

				if (model.has_activity) {
					questStore.addQuestActivityIds([model.quest_id]);
				}
				client.spawnNotification(notification);
				break;
			}

			default:
				client.spawnNotification(notification);
				break;
		}
	}

	function _onClearNotifications(payload: ClearNotificationsPayload) {
		// Don't do anything when the notification originated from this client.
		if (payload.clientId === client.clientId) {
			return;
		}

		client.clearNotifications(payload.type, payload.data);
	}

	function _onStickerUnlock(payload: StickerUnlockPayload) {
		if (!appStore.hasNewUnlockedStickers.value) {
			appStore.setHasNewUnlockedStickers(true);
		}

		onNewStickers.next(payload.sticker_img_urls);
	}

	function _onPostUpdated(payload: PostUpdatedPayload) {
		const post = reactive(new FiresidePost(payload.post_data)) as FiresidePost;

		if (payload.was_published) {
			// Send out a growl to let the user know that their post was updated.
			FiresidePostGotoGrowl.show(
				post,
				payload.was_scheduled ? 'scheduled-publish' : 'publish'
			);
		}
	}

	/**
	 * Clear notification status for a particular notification type.
	 */
	function pushViewNotifications(
		type: ClearNotificationsType,
		data: ClearNotificationsData = {}
	) {
		return channelController.push('view-notifications', {
			type,
			data,
			clientId: client.clientId,
		});
	}

	async function pushCommunityBootstrap(communityId: number) {
		interface Payload {
			status: string;
			community_id: string;
			body: {
				unreadChannels: number[];
				unreadFeatured: boolean;
			};
		}

		const payload = await channelController.push<Payload>('request-community-bootstrap', {
			community_id: communityId.toString(),
		});

		const communityState = communityStates.value.getCommunityState(communityId);

		// This flag was set to true in the main bootstrap and we need to unset
		// it now that we have the actual unread channels in this community.
		// read comment in client service for more info.
		communityState.hasUnreadPosts = false;
		communityState.dataBootstrapped = true;

		communityState.hasUnreadFeaturedPosts = payload.body.unreadFeatured;
		for (const channelId of payload.body.unreadChannels) {
			communityState.markChannelUnread(channelId);
		}
	}

	return c;
}
