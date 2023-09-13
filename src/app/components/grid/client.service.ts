import { Channel } from 'phoenix';
import { markRaw, reactive } from 'vue';
import { Analytics } from '../../../_common/analytics/analytics.service';
import { CommunityModel } from '../../../_common/community/community.model';
import { ensureConfig } from '../../../_common/config/config.service';
import { Environment } from '../../../_common/environment/environment.service';
import { FiresideModel } from '../../../_common/fireside/fireside.model';
import { FiresidePostCommunityModel } from '../../../_common/fireside/post/community/community.model';
import { FiresidePostModel } from '../../../_common/fireside/post/post-model';
import { FiresideStreamNotificationModel } from '../../../_common/fireside/stream-notification/stream-notification.model';
import { GameTrophyModel } from '../../../_common/game/trophy/trophy.model';
import { showInfoGrowl } from '../../../_common/growls/growls.service';
import { ModelStoreModel } from '../../../_common/model/model-store.service';
import { Model } from '../../../_common/model/model.service';
import {
	NotificationModel,
	NotificationType,
} from '../../../_common/notification/notification-model';
import { NotificationText } from '../../../_common/notification/notification-text.service';
import Onboarding from '../../../_common/onboarding/onboarding.service';
import { SettingFeedNotifications } from '../../../_common/settings/settings.service';
import { SiteTrophyModel } from '../../../_common/site/trophy/trophy.model';
import {
	SocketController,
	createSocketController,
} from '../../../_common/socket/socket-controller';
import { commonStore } from '../../../_common/store/common-store';
import { EventTopic } from '../../../_common/system/event/event-topic';
import { $gettext } from '../../../_common/translate/translate.service';
import { getTrophyImg } from '../../../_common/trophy/thumbnail/AppTrophyThumbnail.vue';
import { UserGameTrophyModel } from '../../../_common/user/trophy/game-trophy.model';
import { UserSiteTrophyModel } from '../../../_common/user/trophy/site-trophy.model';
import { UserModel } from '../../../_common/user/user.model';
import { arrayRemove } from '../../../utils/array';
import { createLogger } from '../../../utils/logging';
import { sleep } from '../../../utils/utils';
import { uuidv4 } from '../../../utils/uuid';
import { AppStore } from '../../store/index';
import { router } from '../../views';
import { gotoNotification } from '../activity/feed/notification/notification-routing';
import { ChatClient, clearChat, connectChat, createChatClient } from '../chat/client';
import {
	CommentTopicPayload,
	GridCommentChannel,
	createGridCommentChannel,
} from './comment-channel';
import { GridFiresideChannel } from './fireside-channel';
import { GridFiresideDMChannel } from './fireside-dm-channel';
import { GridNotificationChannel, createGridNotificationChannel } from './notification-channel';

export const onFiresideStart = new EventTopic<Model | ModelStoreModel>();

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

export interface ClearNotificationsEventData extends ClearNotificationsPayload {
	currentCount: number;
}

export type OnConnectedHandler = (grid: GridClient) => void;
export type DeregisterOnConnected = () => void;

/**
 * List of resolvers waiting for grid to connect.
 * These resolvers get resolved in the connect function once Grid connected.
 */
let connectionResolvers: (() => void)[] = [];

/**
 * Resolves once Grid is fully connected.
 */
function tillConnection(client: GridClient) {
	return new Promise<void>(resolve => {
		if (client.connected) {
			resolve();
		} else {
			connectionResolvers.push(resolve);
		}
	});
}

export function createGridClient({ appStore }: { appStore: AppStore }) {
	// Don't want to unwrap the refs from the app store.
	const client = reactive(new GridClient(markRaw(appStore))) as unknown as GridClient;

	client.init();

	return client;
}

export class GridClient {
	constructor(public readonly appStore: AppStore) {}

	readonly logger = createLogger('Grid');

	// Stores a unique id that identifies this session when it pushes data to Grid.
	readonly clientId = uuidv4();

	// Will get created in "init".
	socketController: SocketController = null as any;
	connected = false;
	isGuest = false;
	channels: Channel[] = [];
	bootstrapReceived = false;
	bootstrapTimestamp = 0;
	bootstrapDelay = 1;
	chat: ChatClient | null = null;
	firesideChannels: GridFiresideChannel[] = [];
	firesideDMChannels: GridFiresideDMChannel[] = [];
	notificationChannel: GridNotificationChannel | null = null;

	commentChannel: GridCommentChannel | null = null;

	/**
	 * @see `deregisterViewingCommunity` doc-block for explanation.
	 */
	viewingCommunityId: number | null = null;

	/**
	 * If set, will connect as a guest, using this token.
	 */
	private guestToken: string | null = null;

	/**
	 * Store ids of posts the user has featured.
	 * The Grid client will ignore any incoming feature notifications for posts recorded here,
	 * because users that feature posts should not get notified about those exact posts.
	 */
	featuredPostIds: Set<number> = new Set<number>();

	/**
	 * Callbacks to run when this grid client gets connected.
	 */
	onConnectedHandlers: OnConnectedHandler[] = [];

	registerOnConnected(cb: OnConnectedHandler): DeregisterOnConnected {
		this.onConnectedHandlers.push(cb);
		return () => arrayRemove(this.onConnectedHandlers, i => i === cb);
	}

	init() {
		this.socketController = markRaw(
			createSocketController({
				commonStore,
				logContext: 'Grid',
				onDisconnect: () => {
					this.reconnect(0);
				},
			})
		);

		this.chat = createChatClient({
			grid: this,
			appStore: this.appStore,
		});

		this.connect();
	}

	async setGuestToken(guestToken: string) {
		const tokenChanged = this.guestToken !== guestToken;
		this.guestToken = guestToken;

		if (!this.isGuest || tokenChanged) {
			await this.disconnect();
			this.isGuest = true;
			this.connect();
		}
	}

	async unsetGuestToken() {
		this.guestToken = null;

		if (this.isGuest) {
			await this.disconnect();
			this.isGuest = false;
			this.connect();
		}
	}

	private async connect() {
		const { isGuest, guestToken } = this;
		const { user } = commonStore;

		const didConnect = await this.socketController.connect({
			socketUrl: Environment.grid,
			isGuest,
			guestToken,
			hostSuffix: '/grid/socket',
		});

		if (!didConnect) {
			return;
		}

		// Freeze the cancel token we're using.
		const cancelToken = this.socketController.cancelToken.value;

		// Make sure their remote config is setup before connecting fully to
		// grid. We might end up handling things differently depending on their
		// split tests.
		await ensureConfig();

		if (cancelToken.isCanceled) {
			return;
		}

		// Guest connections are only used for realtime stuff like fireside
		// state updates. They don't need to do any more setup work beyond
		// successfully connecting to the socket.
		if (this.isGuest) {
			this.markConnected();
		}
		// User connections expected to handle a bunch of notification stuff.
		else if (user.value) {
			const notificationChannel = createGridNotificationChannel(this, {
				userId: user.value.id,
				router,
			});
			await notificationChannel.joinPromise;
			this.notificationChannel = markRaw(notificationChannel);

			const commentChannel = createGridCommentChannel(this, { userId: user.value.id });
			await commentChannel.joinPromise;
			this.commentChannel = markRaw(commentChannel);
			this.markConnected();
		}

		// Now connect to our chat channels.
		await connectChat(this.chat!);
	}

	markConnected() {
		this.connected = true;
		for (const resolver of connectionResolvers) {
			resolver();
		}
		connectionResolvers = [];

		for (const handler of this.onConnectedHandlers) {
			try {
				handler(this);
			} catch (e) {
				this.logger.error('Error during connection handler for grid', e);
			}
		}
	}

	async disconnect() {
		if (this.connected) {
			this.logger.info('Disconnecting...');
		} else {
			this.logger.warn('Disconnecting (before we got fully connected)');
		}

		// Continue attempting to disconnect even if we didn't get fully
		// connected. This should tear down the channels and socket that may
		// have connected already, which allows us to cleanly reuse the instance
		// for the next connection.

		this.connected = false;
		this.bootstrapReceived = false;
		this.bootstrapTimestamp = 0;

		this.firesideChannels = [];
		this.firesideDMChannels = [];
		this.notificationChannel = null;
		this.commentChannel = null;

		clearChat(this.chat!);

		this.socketController.disconnect();
	}

	async reconnect(sleepMs = 2_000) {
		// sleep a bit before trying to reconnect
		await sleep(sleepMs);

		// teardown and try to reconnect
		if (this.connected) {
			await this.disconnect();
		}
		this.connect();
	}

	spawnNotification(notification: NotificationModel) {
		const feedType = notification.feedType;

		// Activity feed types should always increment. Notification feed types
		// require extra checks.
		const wantsCountIncrement =
			feedType === 'activity' ||
			(feedType === 'notifications' && notification.is_notification_feed_item);

		if (wantsCountIncrement) {
			this.appStore.incrementNotificationCount({ count: 1, type: feedType });
		}

		// In Client when the feed notifications setting is disabled, don't show them notifications.
		// On site we only use it to disable native browser notifications, but still try to show in
		// the Growl.
		if (GJ_IS_DESKTOP_APP && !SettingFeedNotifications.get()) {
			return;
		}

		// Don't show Notification growls if the user is still in onboarding.
		if (Onboarding.isOnboarding) {
			return;
		}

		let message = NotificationText.getText(notification, true);
		let icon = '';
		if (notification.from_model instanceof UserModel) {
			icon = notification.from_model.img_avatar;
		} else if (notification.from_model instanceof CommunityModel) {
			icon = notification.from_model.img_thumbnail;
		}

		// When it's a game post as game owner, use the game owner's avatar instead.
		if (
			notification.action_model instanceof FiresidePostModel &&
			notification.action_model.as_game_owner &&
			!!notification.action_model.game
		) {
			icon = notification.action_model.game.developer.img_avatar;
		}

		let isSystem = SettingFeedNotifications.get();
		if (!this.notificationChannel?.isTabLeader.value) {
			isSystem = false;
		}

		if (message !== undefined) {
			let title = $gettext('New Notification');
			if (notification.type === NotificationType.PostAdd) {
				if (notification.from_model instanceof UserModel) {
					// We send a notification to the author of the post.
					// Do not show a notification in that case, the purpose is to increment the activity feed counter.
					if (notification.from_model.id === commonStore.user.value?.id) {
						return;
					}

					let username = notification.from_model.username;

					// When it's a game post as game owner, use the game owner's username instead.
					if (
						notification.action_model instanceof FiresidePostModel &&
						notification.action_model.as_game_owner &&
						!!notification.action_model.game
					) {
						username = notification.action_model.game.developer.username;
					}

					title = $gettext(`New Post by @%{ username }`, {
						username,
					});
				} else {
					title = $gettext('New Post');
				}
			} else if (notification.type === NotificationType.GameTrophyAchieved) {
				if (
					notification.action_model instanceof UserGameTrophyModel &&
					notification.action_model.trophy instanceof GameTrophyModel
				) {
					title = $gettext(`Trophy Unlocked!`);
					message = notification.action_model.trophy.title;
					icon = getTrophyImg(notification.action_model.trophy);
				}
			} else if (notification.type === NotificationType.SiteTrophyAchieved) {
				if (
					notification.action_model instanceof UserSiteTrophyModel &&
					notification.action_model.trophy instanceof SiteTrophyModel
				) {
					title = $gettext(`Trophy Unlocked!`);
					message = notification.action_model.trophy.title;
					icon = getTrophyImg(notification.action_model.trophy);
				}
			} else if (notification.type === NotificationType.PostFeaturedInCommunity) {
				if (notification.action_model instanceof FiresidePostCommunityModel) {
					icon = notification.action_model.community.img_thumbnail;
				}
			} else if (notification.type === NotificationType.FiresideStart) {
				if (notification.action_model instanceof FiresideModel) {
					title = notification.action_model.title;
				}
			} else if (notification.type === NotificationType.FiresideStreamNotification) {
				if (notification.action_model instanceof FiresideStreamNotificationModel) {
					title = $gettext('Fireside Stream');
					icon = notification.action_model.users[0].img_avatar;
				}
			} else if (notification.type === NotificationType.ChargedSticker) {
				title = $gettext('Charged Sticker');
			}

			showInfoGrowl({
				title,
				message,
				icon,
				onClick: () => {
					Analytics.trackEvent('grid', 'notification-click', notification.type);
					gotoNotification(notification, { router, appStore: this.appStore });
				},
				system: isSystem,
			});
		} else {
			// Received a notification that cannot be parsed properly...
			this.logger.error('Received notification that cannot be displayed.', notification.type);
		}
	}

	clearNotifications(type: ClearNotificationsType, data: ClearNotificationsData = {}) {
		switch (type) {
			case 'activity':
				this.appStore.setNotificationCount({
					type: 'activity',
					count: 0,
				});
				break;
			case 'notifications':
				this.appStore.setNotificationCount({
					type: 'notifications',
					count: 0,
				});
				break;
			case 'community-channel':
				{
					const communityChannelId = data.channelId as number;
					const communityId = data.communityId as number;
					const communityState =
						this.appStore.communityStates.value.getCommunityState(communityId);
					communityState.markChannelRead(communityChannelId);
				}
				break;
			case 'community-featured':
				{
					const communityId = data.communityId as number;
					const communityState =
						this.appStore.communityStates.value.getCommunityState(communityId);
					communityState.hasUnreadFeaturedPosts = false;
				}
				break;
			case 'community-unread':
				{
					const communityId = data.communityId as number;
					const communityState =
						this.appStore.communityStates.value.getCommunityState(communityId);
					communityState.hasUnreadPosts = false;
				}
				break;
			case 'friend-requests':
				this.appStore.setHasNewFriendRequests(false);
				break;
			case 'new-quest':
				{
					const questId = data.questId ?? -1;
					if (questId !== -1) {
						this.appStore
							.getQuestStore()
							.clearNewQuestIds([questId], { pushView: false });
					}
				}
				break;
			case 'quest-activity':
				{
					const questId = data.questId ?? -1;
					if (questId !== -1) {
						this.appStore
							.getQuestStore()
							.clearQuestActivityIds([questId], { pushView: false });
					}
				}
				break;
		}
	}

	async joinCommunity(community: CommunityModel) {
		const cancelToken = this.socketController.cancelToken.value;

		if (cancelToken.isCanceled) {
			this.logger.info(
				`Aborted connection (6) (while joining community: ${community.name}, id: ${community.id}`
			);
			return;
		}

		this.notificationChannel?.joinCommunity({
			community_id: community.id,
		});

		return;
	}

	async leaveCommunity(community: CommunityModel) {
		this.notificationChannel?.leaveCommunity({
			community_id: community.id,
		});
	}

	async startListeningToCommentsReactions(data: CommentTopicPayload) {
		if (this.commentChannel) {
			this.commentChannel.startListeningToCommentsReactions(data);
		}
	}

	async stopListeningToCommentsReactions(data: CommentTopicPayload) {
		if (this.commentChannel) {
			this.commentChannel.stopListeningToCommentsReactions(data);
		}
	}

	recordFeaturedPost(post: FiresidePostModel) {
		if (!this.featuredPostIds.has(post.id)) {
			this.featuredPostIds.add(post.id);
		}
	}

	async pushViewNotifications(
		type: ClearNotificationsType,
		data: ClearNotificationsData = {},
		doClearNotifications = true
	) {
		// This can get invoked before grid is up and running, so wait here
		// until it is. That can mainly happen when the route-resolve for a page
		// clears notifications. For example: main feed page clears
		// notifications in backend as the route loads, but grid is not loaded
		// yet.
		await tillConnection(this);

		if (doClearNotifications) {
			// Clear notifications on this client.
			this.clearNotifications(type, data);
		}

		this.notificationChannel?.pushViewNotifications(type, data);
	}

	async queueRequestCommunityBootstrap(communityId: number) {
		await tillConnection(this);

		if (this.notificationChannel) {
			this.viewingCommunityId = communityId;
			this.notificationChannel.pushCommunityBootstrap(communityId);
		}
	}

	/**
	 * When viewing a community, Grid calls in the community bootstrap
	 * (request-community-bootstrap). In case Grid disconnects while the user is
	 * viewing the community, we want to rebootstrap the community as well after
	 * the normal Grid bootstrap went through.
	 *
	 * Do keep track of which community the user is viewing, we register the
	 * community with Grid when calling queueRequestCommunityBootstrap.
	 *
	 * When leaving the community page, deregister the community to avoid
	 * uselessly bootstrapping it.
	 */
	deregisterViewingCommunity(communityId: number) {
		if (this.viewingCommunityId !== communityId) {
			this.logger.warn(
				'Deregistering a community id that did not match the currently registered one!',
				communityId,
				this.viewingCommunityId
			);
		}
		this.viewingCommunityId = null;
	}
}
