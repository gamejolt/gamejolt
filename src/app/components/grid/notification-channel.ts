import { computed, reactive, shallowReadonly } from 'vue';
import { Router } from 'vue-router';
import { importNoSSR } from '../../../_common/code-splitting';
import { CurrencyType } from '../../../_common/currency/currency-type';
import { FiresidePostGotoGrowl } from '../../../_common/fireside/post/goto-growl/goto-growl.service';
import { FiresidePostModel } from '../../../_common/fireside/post/post-model';
import {
	NotificationModel,
	NotificationType,
} from '../../../_common/notification/notification-model';
import { QuestNotificationModel } from '../../../_common/quest/quest-notification-model';
import { createSocketChannelController } from '../../../_common/socket/socket-controller';
import { commonStore } from '../../../_common/store/common-store';
import { TabLeaderInterface } from '../../../utils/tab-leader';
import { addNewQuestIds, addQuestActivityIds } from '../../store/quest';
import { shouldUseFYPDefault } from '../../views/home/home-feed.service';
import { GridClient } from './client.service';
const TabLeaderLazy = importNoSSR(async () => await import('../../../utils/tab-leader'));

export type GridNotificationChannel = ReturnType<typeof createGridNotificationChannel>;

interface ChargeData {
	charge: number;
	costs: { [type: string]: number };
	cycle: {
		decay: number;
		length: number;
		'start-hour': number;
	};
	max: number;
}

interface JoinPayload {
	hasNewFriendRequests: boolean;
	hasUnreadNotifications: boolean;
	lastNotificationTime: number;
	notificationCount: number;
	activityUnreadCount: number;
	activityUnreadCounts: { [countId: string]: number };
	notificationUnreadCount: number;
	unreadFeaturedCommunities: { [communityId: number]: number };
	unreadCommunities: number[];
	newQuestIds: number[];
	questActivityIds: number[];
	charge: ChargeData;
	coinBalance: number;
	buxBalance: number;
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

interface SubscriptionCommunityData {
	community_id: number;
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

interface WalletUpdatedPayload {
	identifier: string;
	available_balance: number;
}

// from community channel
interface FeaturePayload {
	community_id: string;
	post_id: string;
}

interface NewPostPayload {
	community_id: string;
	channel_id: string;
}

export function createGridNotificationChannel(
	client: GridClient,
	options: { userId: number; router: Router }
) {
	const { socketController, appStore } = client;
	const { userId } = options;
	const { communityStates, stickerStore } = appStore;

	let _tabLeader: TabLeaderInterface | null = null;
	const isTabLeader = computed(() => _tabLeader?.isLeader ?? false);

	const channelController = createSocketChannelController(
		`notifications:${userId}`,
		socketController
	);

	channelController.listenTo('new-notification', _onNewNotification);
	channelController.listenTo('clear-notifications', _onClearNotifications);
	channelController.listenTo('post-updated', _onPostUpdated);
	channelController.listenTo('wallet-updated', _onWalletUpdated);

	// from community channel
	channelController.listenTo('feature', _onFeature);
	channelController.listenTo('new-post', _onNewPost);

	const joinPromise = channelController.join({
		async onJoin(payload: JoinPayload) {
			const { TabLeader } = await TabLeaderLazy;
			_tabLeader = new TabLeader('grid_notification_channel_' + userId);
			_tabLeader.init();

			let activityUnreadCount = payload.activityUnreadCount;

			// If the FYP feed is the default feed, community feature items will
			// not be returned in the home feed. Only show new-counts from posts
			// of sources the user follows.
			if (shouldUseFYPDefault()) {
				activityUnreadCount = payload.activityUnreadCounts['following'];
			}

			appStore.setUnreadActivityCount(activityUnreadCount);
			appStore.setHasUnreadNotifications(payload.hasUnreadNotifications);

			appStore.setHasNewFriendRequests(payload.hasNewFriendRequests);

			const questStore = appStore.getQuestStore();

			// Clear out old quest ids before adding new ones.
			questStore.newQuestIds.value.clear();
			questStore.questActivityIds.value.clear();

			addNewQuestIds(questStore, payload.newQuestIds);
			addQuestActivityIds(questStore, payload.questActivityIds);

			commonStore.coinBalance.value = payload.coinBalance;
			commonStore.joltbuxBalance.value = payload.buxBalance;

			const {
				charge,
				max,
				costs: { sticker: cost },
			} = payload.charge;

			stickerStore.setChargeData({
				charge,
				max,
				cost,
			});

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

	const c = shallowReadonly({
		channelController,
		userId,
		isTabLeader,
		joinPromise,

		pushViewNotifications,
		joinCommunity,
		leaveCommunity,
		pushCommunityBootstrap,
	});

	function _onNewNotification(payload: NewNotificationPayload) {
		const data = payload.notification_data.event_item;
		const notification = reactive(new NotificationModel(data)) as NotificationModel;

		switch (notification.type) {
			case NotificationType.FriendshipRequest:
				// For an incoming friend request, set that they have a new friend request.
				appStore.setHasNewFriendRequests(true);
				client.spawnNotification(notification);
				break;

			case NotificationType.QuestNotification: {
				if (!(notification.action_model instanceof QuestNotificationModel)) {
					break;
				}

				const questStore = appStore.getQuestStore();
				const model = notification.action_model;
				if (model.is_new) {
					addNewQuestIds(questStore, [model.quest_id]);
				}

				if (model.has_activity) {
					addQuestActivityIds(questStore, [model.quest_id]);
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

	function _onPostUpdated(payload: PostUpdatedPayload) {
		const post = reactive(new FiresidePostModel(payload.post_data)) as FiresidePostModel;

		if (payload.was_published) {
			// Send out a growl to let the user know that their post was updated.
			FiresidePostGotoGrowl.show(
				post,
				payload.was_scheduled ? 'scheduled-publish' : 'publish'
			);
		}
	}

	function _onWalletUpdated(payload: WalletUpdatedPayload) {
		if (payload.identifier === CurrencyType.coins.id) {
			commonStore.coinBalance.value = payload.available_balance;
		} else if (payload.identifier === CurrencyType.joltbux.id) {
			commonStore.joltbuxBalance.value = payload.available_balance;
		}
	}

	// from community channel
	function _onFeature(payload: FeaturePayload) {
		console.log('[community chnl test] Capturing feature event with ' + payload);
		// Suppress notification if the user featured that post.
		if (payload.post_id) {
			const postId = parseInt(payload.post_id, 10);
			if (client.featuredPostIds.has(postId)) {
				return;
			}
		}

		const communityState = appStore.communityStates.value.getCommunityState(
			parseInt(payload.community_id, 10)
		);
		communityState.hasUnreadFeaturedPosts = true;

		// Only increment when we use the activity feed as the home feed, as it
		// includes the community items only at that point.
		if (!shouldUseFYPDefault()) {
			appStore.incrementUnreadActivityCount(1);
		}
	}

	function _onNewPost(payload: NewPostPayload) {
		const channelId = parseInt(payload.channel_id, 10);
		const communityState = appStore.communityStates.value.getCommunityState(
			parseInt(payload.community_id, 10)
		);
		communityState.markChannelUnread(channelId);
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

	function joinCommunity(data: SubscriptionCommunityData) {
		return channelController.push('follow_community', {
			community_id: data.community_id,
		});
	}

	function leaveCommunity(data: SubscriptionCommunityData) {
		return channelController.push('unfollow_community', {
			community_id: data.community_id,
		});
	}

	async function pushCommunityBootstrap(communityId: number) {
		interface Payload {
			unreadFeatured: boolean;
			unreadChannels: number[];
		}

		const payload = await channelController.push<Payload>('community-bootstrap', {
			community_id: communityId.toString(),
		});

		const communityState = communityStates.value.getCommunityState(communityId);

		// This flag was set to true in the main bootstrap and we need to unset
		// it now that we have the actual unread channels in this community.
		// read comment in client service for more info.
		communityState.hasUnreadPosts = false;
		communityState.dataBootstrapped = true;

		communityState.hasUnreadFeaturedPosts = payload.unreadFeatured;
		for (const channelId of payload.unreadChannels) {
			communityState.markChannelUnread(channelId);
		}
	}

	return c;
}
