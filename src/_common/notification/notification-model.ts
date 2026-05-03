import { CollaboratorModel } from '~common/collaborator/collaborator.model';
import { CommentModel } from '~common/comment/comment-model';
import { CommunityModel } from '~common/community/community.model';
import { CommunityUserNotificationModel } from '~common/community/user-notification/user-notification.model';
import { CreatorExperienceLevelModel } from '~common/creator/experience/level.model';
import { FiresidePostCommunityModel } from '~common/fireside/post/community/community.model';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import { ForumPostModel } from '~common/forum/post/post.model';
import { ForumTopicModel } from '~common/forum/topic/topic.model';
import { GameModel } from '~common/game/game.model';
import { GameRatingModel } from '~common/game/rating/rating.model';
import { GameLibraryGameModel } from '~common/game-library/game/game.model';
import { InventoryShopGiftModel } from '~common/inventory/shop/inventory-shop-gift.model';
import { MentionModel } from '~common/mention/mention.model';
import { Model } from '~common/model/model.service';
import { storeModel } from '~common/model/model-store.service';
import { OrderItemModel } from '~common/order/item/item.model';
import { PollModel } from '~common/poll/poll.model';
import { QuestNotificationModel } from '~common/quest/quest-notification-model';
import { SellableModel } from '~common/sellable/sellable.model';
import { StickerPlacementModel } from '~common/sticker/placement/placement.model';
import { SubscriptionModel } from '~common/subscription/subscription.model';
import { SupporterActionModel } from '~common/supporters/action.model';
import { $gettext } from '~common/translate/translate.service';
import { UserFriendshipModel } from '~common/user/friendship/friendship.model';
import { UserGameTrophyModel } from '~common/user/trophy/game-trophy.model';
import { UserSiteTrophyModel } from '~common/user/trophy/site-trophy.model';
import { UserModel, UserTypeDeveloper } from '~common/user/user.model';
import { UserAvatarFrameModel } from '~common/user/user-avatar/frame/frame.model';

export const NotificationTypeCommentAdd = 'comment-add';
export const NotificationTypeCommentAddObjectOwner = 'comment-add-object-owner';
export const NotificationTypeForumPostAdd = 'forum-post-add';
export const NotificationTypeFriendshipRequest = 'friendship-request';
export const NotificationTypeFriendshipAccept = 'friendship-accept';
export const NotificationTypeFriendshipCancel = 'friendship-cancel';
export const NotificationTypeGameRatingAdd = 'game-rating-add';
export const NotificationTypeGameFollow = 'game-follow';
export const NotificationTypePostAdd = 'post-add';
export const NotificationTypePostFeaturedInCommunity = 'post-featured-in-community';
export const NotificationTypeSellableSell = 'sellable-sell';
export const NotificationTypeUserFollow = 'user-follow';
export const NotificationTypeCollaboratorInvite = 'collaborator-invite';
export const NotificationTypeMention = 'mention';
export const NotificationTypeGameTrophyAchieved = 'game-trophy-achieved';
export const NotificationTypeSiteTrophyAchieved = 'site-trophy-achieved';
export const NotificationTypeCommunityUserNotification = 'community-user-notification';
export const NotificationTypeQuestNotification = 'quest-notification';
export const NotificationTypeChargedSticker = 'charged-sticker';
export const NotificationTypeSupporterMessage = 'supporter-message';
export const NotificationTypePollEnded = 'poll-ended';
export const NotificationTypeCreatorLevelUp = 'creator-level-up';
export const NotificationTypeUnlockedAvatarFrame = 'unlocked-avatar-frame';
export const NotificationTypeShopGiftReceived = 'shop-gift-received';

export type NotificationType =
	| typeof NotificationTypeCommentAdd
	| typeof NotificationTypeCommentAddObjectOwner
	| typeof NotificationTypeForumPostAdd
	| typeof NotificationTypeFriendshipRequest
	| typeof NotificationTypeFriendshipAccept
	| typeof NotificationTypeFriendshipCancel
	| typeof NotificationTypeGameRatingAdd
	| typeof NotificationTypeGameFollow
	| typeof NotificationTypePostAdd
	| typeof NotificationTypePostFeaturedInCommunity
	| typeof NotificationTypeSellableSell
	| typeof NotificationTypeUserFollow
	| typeof NotificationTypeCollaboratorInvite
	| typeof NotificationTypeMention
	| typeof NotificationTypeGameTrophyAchieved
	| typeof NotificationTypeSiteTrophyAchieved
	| typeof NotificationTypeCommunityUserNotification
	| typeof NotificationTypeQuestNotification
	| typeof NotificationTypeChargedSticker
	| typeof NotificationTypeSupporterMessage
	| typeof NotificationTypePollEnded
	| typeof NotificationTypeCreatorLevelUp
	| typeof NotificationTypeUnlockedAvatarFrame
	| typeof NotificationTypeShopGiftReceived;

export const ActivityFeedTypes = [NotificationTypePostAdd];

export const NotificationFeedTypes = [
	NotificationTypeCommentAdd,
	NotificationTypeCommentAddObjectOwner,
	NotificationTypeForumPostAdd,
	NotificationTypeFriendshipAccept,
	NotificationTypeGameRatingAdd,
	NotificationTypeGameFollow,
	NotificationTypePostFeaturedInCommunity,
	NotificationTypeSellableSell,
	NotificationTypeUserFollow,
	NotificationTypeMention,
	NotificationTypeCollaboratorInvite,
	NotificationTypeGameTrophyAchieved,
	NotificationTypeSiteTrophyAchieved,
	NotificationTypeCommunityUserNotification,
	NotificationTypeChargedSticker,
	NotificationTypeSupporterMessage,
	NotificationTypePollEnded,
	NotificationTypeCreatorLevelUp,
	NotificationTypeUnlockedAvatarFrame,
	NotificationTypeShopGiftReceived,
];

export class NotificationModel extends Model {
	declare user_id: number;
	declare type: NotificationType;
	declare is_notification_feed_item: boolean;
	declare added_on: number;
	declare viewed_on: number | null;

	declare from_resource: string;
	declare from_resource_id: number;
	declare from_model?: UserModel | CommunityModel | FiresidePostModel;

	declare action_resource: string;
	declare action_resource_id: number;
	declare action_model:
		| CommentModel
		| ForumPostModel
		| UserFriendshipModel
		| GameRatingModel
		| GameLibraryGameModel
		| FiresidePostModel
		| FiresidePostCommunityModel
		| OrderItemModel
		| SubscriptionModel
		| CollaboratorModel
		| MentionModel
		| UserGameTrophyModel
		| UserSiteTrophyModel
		| CommunityUserNotificationModel
		| QuestNotificationModel
		| StickerPlacementModel
		| SupporterActionModel
		| PollModel
		| CreatorExperienceLevelModel
		| UserAvatarFrameModel
		| InventoryShopGiftModel;

	declare to_resource: string | null;
	declare to_resource_id: number | null;
	declare to_model:
		| GameModel
		| UserModel
		| FiresidePostModel
		| ForumTopicModel
		| SellableModel
		| CommunityModel;

	// For feeds.
	declare scroll_id?: string;

	// Generated in constructor.
	is_user_based = false;
	is_game_based = false;
	is_community_based = false;

	constructor(data: any = {}) {
		super(data);

		if (data.from_resource_id) {
			switch (data.from_resource) {
				case 'User':
					this.from_model = new UserModel(data.from_resource_model);
					break;
				case 'Community':
					this.from_model = new CommunityModel(data.from_resource_model);
					break;
				case 'Fireside_Post':
					this.from_model = new FiresidePostModel(data.from_resource_model);
					break;
			}
		}

		if (!this.viewed_on) {
			this.viewed_on = null;
		}

		// Default to `true` if not provided.
		if (typeof data.is_notification_feed_item !== 'boolean') {
			this.is_notification_feed_item = true;
		}

		if (data.to_resource === 'Game') {
			this.to_model = new GameModel(data.to_resource_model);
		} else if (data.to_resource === 'User') {
			this.to_model = new UserModel(data.to_resource_model);
		} else if (data.to_resource === 'Fireside_Post') {
			this.to_model = new FiresidePostModel(data.to_resource_model);
		} else if (data.to_resource === 'Forum_Topic') {
			this.to_model = new ForumTopicModel(data.to_resource_model);
		} else if (data.to_resource === 'Sellable') {
			this.to_model = new SellableModel(data.to_resource_model);
		} else if (data.to_resource === 'Community') {
			this.to_model = new CommunityModel(data.to_resource_model);
		}

		if (this.type === NotificationTypeCommentAdd) {
			this.action_model = storeModel(CommentModel, data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationTypeCommentAddObjectOwner) {
			this.action_model = storeModel(CommentModel, data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationTypeForumPostAdd) {
			this.action_model = new ForumPostModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationTypeFriendshipRequest) {
			this.action_model = new UserFriendshipModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationTypeFriendshipAccept) {
			this.action_model = new UserFriendshipModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationTypeGameRatingAdd) {
			this.action_model = new GameRatingModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationTypeGameFollow) {
			this.action_model = new GameLibraryGameModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationTypePostAdd) {
			this.action_model = new FiresidePostModel(data.action_resource_model);
			this.is_game_based = this.to_model instanceof GameModel;
		} else if (this.type === NotificationTypePostFeaturedInCommunity) {
			this.action_model = new FiresidePostCommunityModel(data.action_resource_model);
		} else if (this.type === NotificationTypeSellableSell) {
			this.action_model = new OrderItemModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationTypeUserFollow) {
			this.action_model = new SubscriptionModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationTypeCollaboratorInvite) {
			this.action_model = new CollaboratorModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationTypeMention) {
			this.action_model = new MentionModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationTypeGameTrophyAchieved) {
			this.action_model = new UserGameTrophyModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationTypeSiteTrophyAchieved) {
			this.action_model = new UserSiteTrophyModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationTypeCommunityUserNotification) {
			this.action_model = new CommunityUserNotificationModel(data.action_resource_model);
			this.is_community_based = true;
		} else if (this.type === NotificationTypeQuestNotification) {
			this.action_model = new QuestNotificationModel(data.action_resource_model);
		} else if (this.type === NotificationTypeChargedSticker) {
			this.action_model = new StickerPlacementModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationTypeSupporterMessage) {
			this.action_model = new SupporterActionModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationTypePollEnded) {
			this.action_model = new PollModel(data.action_resource_model);
		} else if (this.type === NotificationTypeCreatorLevelUp) {
			this.action_model = new CreatorExperienceLevelModel(data.action_resource_model);
		} else if (this.type === NotificationTypeUnlockedAvatarFrame) {
			this.action_model = storeModel(UserAvatarFrameModel, data.action_resource_model);
		} else if (this.type === NotificationTypeShopGiftReceived) {
			this.action_model = storeModel(InventoryShopGiftModel, data.action_resource_model);
			this.is_user_based = true;
		}

		// Keep memory clean after bootstrapping the models (the super
		// constructor will assign all data).
		delete (this as any).from_resource_model;
		delete (this as any).action_resource_model;
		delete (this as any).to_resource_model;
	}

	get feedType() {
		if (ActivityFeedTypes.indexOf(this.type) !== -1) {
			return 'activity';
		} else if (NotificationFeedTypes.indexOf(this.type) !== -1) {
			return 'notifications';
		}
		return '';
	}
}

/**
 * Map of {@link NotificationFeedTypes} and their readable
 * translated labels.
 *
 * Only returns labels the user should be able to see.
 */
export function getNotificationFeedTypeLabels(user: UserModel) {
	const labels = {
		[NotificationTypeCommentAdd]: $gettext(`Comment replies`),
		[NotificationTypeCommentAddObjectOwner]: $gettext(`Comments on your content`),
		[NotificationTypeForumPostAdd]: $gettext(`Forum posts`),
		[NotificationTypeFriendshipAccept]: $gettext(`Accepted friend requests`),
		[NotificationTypePostFeaturedInCommunity]: $gettext(`Post featured`),
		[NotificationTypeUserFollow]: $gettext(`Follows`),
		[NotificationTypeMention]: $gettext(`Mentions`),
		[NotificationTypeCollaboratorInvite]: $gettext(`Collaborator invites`),
		[NotificationTypeGameTrophyAchieved]: $gettext(`Game trophies`),
		[NotificationTypeSiteTrophyAchieved]: $gettext(`Site trophies`),
		[NotificationTypeCommunityUserNotification]: $gettext(`Community actions`),
		[NotificationTypeQuestNotification]: $gettext(`Quests`),
		[NotificationTypeSupporterMessage]: $gettext(`Creator thank-you messages`),
		[NotificationTypePollEnded]: $gettext(`Polls`),
		[NotificationTypeShopGiftReceived]: $gettext(`Gifts`),
	} as Record<NotificationType, string>;

	// Creator notification types.
	if (user.is_creator) {
		labels[NotificationTypeChargedSticker] = $gettext(`Charged stickers`);
		labels[NotificationTypeCreatorLevelUp] = $gettext(`Creator level ups`);
	}

	// Game developer notification types.
	if (user.type === UserTypeDeveloper) {
		labels[NotificationTypeGameRatingAdd] = $gettext(`Game ratings`);
		labels[NotificationTypeGameFollow] = $gettext(`Game follows`);
		labels[NotificationTypeSellableSell] = $gettext(`Sales`);
	}

	return labels;
}

export function $readNotification(model: NotificationModel) {
	// We want this to look like it happens immediately.
	model.viewed_on = Date.now();

	return model.$_save('/web/dash/activity/mark-read/' + model.id, 'notification', {
		detach: true,
	});
}
