import { CollaboratorModel } from '../collaborator/collaborator.model';
import { CommentModel } from '../comment/comment-model';
import { CommunityModel } from '../community/community.model';
import { CommunityUserNotificationModel } from '../community/user-notification/user-notification.model';
import { CreatorExperienceLevelModel } from '../creator/experience/level.model';
import { FiresideCommunityModel } from '../fireside/community/community.model';
import { FiresideModel } from '../fireside/fireside.model';
import { FiresidePostCommunityModel } from '../fireside/post/community/community.model';
import { FiresidePostModel } from '../fireside/post/post-model';
import { FiresideStreamNotificationModel } from '../fireside/stream-notification/stream-notification.model';
import { ForumPostModel } from '../forum/post/post.model';
import { ForumTopicModel } from '../forum/topic/topic.model';
import { GameLibraryGameModel } from '../game-library/game/game.model';
import { GameModel } from '../game/game.model';
import { GameRatingModel } from '../game/rating/rating.model';
import { MentionModel } from '../mention/mention.model';
import { storeModel } from '../model/model-store.service';
import { Model } from '../model/model.service';
import { OrderItemModel } from '../order/item/item.model';
import { PollModel } from '../poll/poll.model';
import { QuestNotificationModel } from '../quest/quest-notification-model';
import { SellableModel } from '../sellable/sellable.model';
import { StickerPlacementModel } from '../sticker/placement/placement.model';
import { SubscriptionModel } from '../subscription/subscription.model';
import { SupporterActionModel } from '../supporters/action.model';
import { $gettext } from '../translate/translate.service';
import { UserFriendshipModel } from '../user/friendship/friendship.model';
import { UserGameTrophyModel } from '../user/trophy/game-trophy.model';
import { UserSiteTrophyModel } from '../user/trophy/site-trophy.model';
import { UserAvatarFrameModel } from '../user/user-avatar/frame/frame.model';
import { UserModel, UserType } from '../user/user.model';

export const enum NotificationType {
	CommentAdd = 'comment-add',
	CommentAddObjectOwner = 'comment-add-object-owner',
	ForumPostAdd = 'forum-post-add',
	FriendshipRequest = 'friendship-request',
	FriendshipAccept = 'friendship-accept',
	FriendshipCancel = 'friendship-cancel',
	GameRatingAdd = 'game-rating-add',
	GameFollow = 'game-follow',
	PostAdd = 'post-add',
	PostFeaturedInCommunity = 'post-featured-in-community',
	SellableSell = 'sellable-sell',
	UserFollow = 'user-follow',
	CollaboratorInvite = 'collaborator-invite',
	Mention = 'mention',
	GameTrophyAchieved = 'game-trophy-achieved',
	SiteTrophyAchieved = 'site-trophy-achieved',
	CommunityUserNotification = 'community-user-notification',
	FiresideStart = 'fireside-start',
	FiresideStreamNotification = 'fireside-stream-notification',
	FiresideFeaturedInCommunity = 'fireside-featured-in-community',
	QuestNotification = 'quest-notification',
	ChargedSticker = 'charged-sticker',
	SupporterMessage = 'supporter-message',
	PollEnded = 'poll-ended',
	CreatorLevelUp = 'creator-level-up',
	UnlockedAvatarFrame = 'unlocked-avatar-frame',
}

export const ActivityFeedTypes = [NotificationType.PostAdd];

export const NotificationFeedTypes = [
	NotificationType.CommentAdd,
	NotificationType.CommentAddObjectOwner,
	NotificationType.ForumPostAdd,
	NotificationType.FriendshipAccept,
	NotificationType.GameRatingAdd,
	NotificationType.GameFollow,
	NotificationType.PostFeaturedInCommunity,
	NotificationType.SellableSell,
	NotificationType.UserFollow,
	NotificationType.Mention,
	NotificationType.CollaboratorInvite,
	NotificationType.GameTrophyAchieved,
	NotificationType.SiteTrophyAchieved,
	NotificationType.CommunityUserNotification,
	NotificationType.FiresideFeaturedInCommunity,
	NotificationType.ChargedSticker,
	NotificationType.SupporterMessage,
	NotificationType.PollEnded,
	NotificationType.CreatorLevelUp,
	NotificationType.UnlockedAvatarFrame,
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
		| FiresideModel
		| FiresideStreamNotificationModel
		| FiresideCommunityModel
		| QuestNotificationModel
		| StickerPlacementModel
		| SupporterActionModel
		| PollModel
		| CreatorExperienceLevelModel
		| UserAvatarFrameModel;

	declare to_resource: string | null;
	declare to_resource_id: number | null;
	declare to_model:
		| GameModel
		| UserModel
		| FiresidePostModel
		| ForumTopicModel
		| SellableModel
		| CommunityModel
		| FiresideModel;

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
		} else if (data.to_resource === 'Fireside') {
			this.to_model = new FiresideModel(data.to_resource_model);
		}

		if (this.type === NotificationType.CommentAdd) {
			this.action_model = storeModel(CommentModel, data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationType.CommentAddObjectOwner) {
			this.action_model = storeModel(CommentModel, data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationType.ForumPostAdd) {
			this.action_model = new ForumPostModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationType.FriendshipRequest) {
			this.action_model = new UserFriendshipModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationType.FriendshipAccept) {
			this.action_model = new UserFriendshipModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationType.GameRatingAdd) {
			this.action_model = new GameRatingModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationType.GameFollow) {
			this.action_model = new GameLibraryGameModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationType.PostAdd) {
			this.action_model = new FiresidePostModel(data.action_resource_model);
			this.is_game_based = this.to_model instanceof GameModel;
		} else if (this.type === NotificationType.PostFeaturedInCommunity) {
			this.action_model = new FiresidePostCommunityModel(data.action_resource_model);
		} else if (this.type === NotificationType.SellableSell) {
			this.action_model = new OrderItemModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationType.UserFollow) {
			this.action_model = new SubscriptionModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationType.CollaboratorInvite) {
			this.action_model = new CollaboratorModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationType.Mention) {
			this.action_model = new MentionModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationType.GameTrophyAchieved) {
			this.action_model = new UserGameTrophyModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationType.SiteTrophyAchieved) {
			this.action_model = new UserSiteTrophyModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationType.CommunityUserNotification) {
			this.action_model = new CommunityUserNotificationModel(data.action_resource_model);
			this.is_community_based = true;
		} else if (this.type === NotificationType.FiresideStart) {
			this.action_model = new FiresideModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationType.FiresideStreamNotification) {
			this.action_model = new FiresideStreamNotificationModel(data.action_resource_model);
		} else if (this.type === NotificationType.FiresideFeaturedInCommunity) {
			this.action_model = new FiresideCommunityModel(data.action_resource_model);
		} else if (this.type === NotificationType.QuestNotification) {
			this.action_model = new QuestNotificationModel(data.action_resource_model);
		} else if (this.type === NotificationType.ChargedSticker) {
			this.action_model = new StickerPlacementModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationType.SupporterMessage) {
			this.action_model = new SupporterActionModel(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === NotificationType.PollEnded) {
			this.action_model = new PollModel(data.action_resource_model);
		} else if (this.type === NotificationType.CreatorLevelUp) {
			this.action_model = new CreatorExperienceLevelModel(data.action_resource_model);
		} else if (this.type === NotificationType.UnlockedAvatarFrame) {
			this.action_model = storeModel(UserAvatarFrameModel, data.action_resource_model);
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
		[NotificationType.CommentAdd]: $gettext(`Comment replies`),
		[NotificationType.CommentAddObjectOwner]: $gettext(`Comments on your content`),
		[NotificationType.ForumPostAdd]: $gettext(`Forum posts`),
		[NotificationType.FriendshipAccept]: $gettext(`Accepted friend requests`),
		[NotificationType.PostFeaturedInCommunity]: $gettext(`Post featured`),
		[NotificationType.UserFollow]: $gettext(`Follows`),
		[NotificationType.Mention]: $gettext(`Mentions`),
		[NotificationType.CollaboratorInvite]: $gettext(`Collaborator invites`),
		[NotificationType.GameTrophyAchieved]: $gettext(`Game trophies`),
		[NotificationType.SiteTrophyAchieved]: $gettext(`Site trophies`),
		[NotificationType.CommunityUserNotification]: $gettext(`Community actions`),
		[NotificationType.FiresideFeaturedInCommunity]: $gettext(`Community featured firesides`),
		[NotificationType.QuestNotification]: $gettext(`Quests`),
		[NotificationType.SupporterMessage]: $gettext(`Creator thank-you messages`),
		[NotificationType.PollEnded]: $gettext(`Polls`),
	} as Record<NotificationType, string>;

	// Creator notification types.
	if (user.is_creator) {
		labels[NotificationType.ChargedSticker] = $gettext(`Charged stickers`);
		labels[NotificationType.CreatorLevelUp] = $gettext(`Creator level ups`);
	}

	// Game developer notification types.
	if (user.type === UserType.Developer) {
		labels[NotificationType.GameRatingAdd] = $gettext(`Game ratings`);
		labels[NotificationType.GameFollow] = $gettext(`Game follows`);
		labels[NotificationType.SellableSell] = $gettext(`Sales`);
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
