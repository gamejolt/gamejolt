import { Collaborator } from '../collaborator/collaborator.model';
import { Comment } from '../comment/comment-model';
import { Community } from '../community/community.model';
import { CommunityUserNotification } from '../community/user-notification/user-notification.model';
import { CreatorExperienceLevel } from '../creator/experience/level.model';
import { FiresideCommunity } from '../fireside/community/community.model';
import { Fireside } from '../fireside/fireside.model';
import { FiresidePostCommunity } from '../fireside/post/community/community.model';
import { FiresidePost } from '../fireside/post/post-model';
import { FiresideStreamNotification } from '../fireside/stream-notification/stream-notification.model';
import { ForumPost } from '../forum/post/post.model';
import { ForumTopic } from '../forum/topic/topic.model';
import { GameLibraryGame } from '../game-library/game/game.model';
import { Game } from '../game/game.model';
import { GameRating } from '../game/rating/rating.model';
import { Mention } from '../mention/mention.model';
import { storeModel } from '../model/model-store.service';
import { Model, defineLegacyModel } from '../model/model.service';
import { OrderItem } from '../order/item/item.model';
import { Poll } from '../poll/poll.model';
import { QuestNotification } from '../quest/quest-notification-model';
import { Sellable } from '../sellable/sellable.model';
import { StickerPlacement } from '../sticker/placement/placement.model';
import { Subscription } from '../subscription/subscription.model';
import { SupporterAction } from '../supporters/action.model';
import { $gettext } from '../translate/translate.service';
import { UserFriendship } from '../user/friendship/friendship.model';
import { UserGameTrophy } from '../user/trophy/game-trophy.model';
import { UserSiteTrophy } from '../user/trophy/site-trophy.model';
import { UserAvatarFrame } from '../user/user-avatar/frame/frame.model';
import { User, UserType } from '../user/user.model';

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

export class Notification extends defineLegacyModel(
	class NotificationDefinition extends Model {
		declare user_id: number;
		declare type: NotificationType;
		declare is_notification_feed_item: boolean;
		declare added_on: number;
		declare viewed_on: number | null;

		declare from_resource: string;
		declare from_resource_id: number;
		declare from_model?: User | Community | FiresidePost;

		declare action_resource: string;
		declare action_resource_id: number;
		declare action_model:
			| Comment
			| ForumPost
			| UserFriendship
			| GameRating
			| GameLibraryGame
			| FiresidePost
			| FiresidePostCommunity
			| OrderItem
			| Subscription
			| Collaborator
			| Mention
			| UserGameTrophy
			| UserSiteTrophy
			| CommunityUserNotification
			| Fireside
			| FiresideStreamNotification
			| FiresideCommunity
			| QuestNotification
			| StickerPlacement
			| SupporterAction
			| Poll
			| CreatorExperienceLevel
			| UserAvatarFrame;

		declare to_resource: string | null;
		declare to_resource_id: number | null;
		declare to_model: Game | User | FiresidePost | ForumTopic | Sellable | Community | Fireside;

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
						this.from_model = new User(data.from_resource_model);
						break;
					case 'Community':
						this.from_model = new Community(data.from_resource_model);
						break;
					case 'Fireside_Post':
						this.from_model = new FiresidePost(data.from_resource_model);
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
				this.to_model = new Game(data.to_resource_model);
			} else if (data.to_resource === 'User') {
				this.to_model = new User(data.to_resource_model);
			} else if (data.to_resource === 'Fireside_Post') {
				this.to_model = new FiresidePost(data.to_resource_model);
			} else if (data.to_resource === 'Forum_Topic') {
				this.to_model = new ForumTopic(data.to_resource_model);
			} else if (data.to_resource === 'Sellable') {
				this.to_model = new Sellable(data.to_resource_model);
			} else if (data.to_resource === 'Community') {
				this.to_model = new Community(data.to_resource_model);
			} else if (data.to_resource === 'Fireside') {
				this.to_model = new Fireside(data.to_resource_model);
			}

			if (this.type === NotificationType.CommentAdd) {
				this.action_model = storeModel(Comment, data.action_resource_model);
				this.is_user_based = true;
			} else if (this.type === NotificationType.CommentAddObjectOwner) {
				this.action_model = storeModel(Comment, data.action_resource_model);
				this.is_user_based = true;
			} else if (this.type === NotificationType.ForumPostAdd) {
				this.action_model = new ForumPost(data.action_resource_model);
				this.is_user_based = true;
			} else if (this.type === NotificationType.FriendshipRequest) {
				this.action_model = new UserFriendship(data.action_resource_model);
				this.is_user_based = true;
			} else if (this.type === NotificationType.FriendshipAccept) {
				this.action_model = new UserFriendship(data.action_resource_model);
				this.is_user_based = true;
			} else if (this.type === NotificationType.GameRatingAdd) {
				this.action_model = new GameRating(data.action_resource_model);
				this.is_user_based = true;
			} else if (this.type === NotificationType.GameFollow) {
				this.action_model = new GameLibraryGame(data.action_resource_model);
				this.is_user_based = true;
			} else if (this.type === NotificationType.PostAdd) {
				this.action_model = new FiresidePost(data.action_resource_model);
				this.is_game_based = this.to_model instanceof Game;
			} else if (this.type === NotificationType.PostFeaturedInCommunity) {
				this.action_model = new FiresidePostCommunity(data.action_resource_model);
			} else if (this.type === NotificationType.SellableSell) {
				this.action_model = new OrderItem(data.action_resource_model);
				this.is_user_based = true;
			} else if (this.type === NotificationType.UserFollow) {
				this.action_model = new Subscription(data.action_resource_model);
				this.is_user_based = true;
			} else if (this.type === NotificationType.CollaboratorInvite) {
				this.action_model = new Collaborator(data.action_resource_model);
				this.is_user_based = true;
			} else if (this.type === NotificationType.Mention) {
				this.action_model = new Mention(data.action_resource_model);
				this.is_user_based = true;
			} else if (this.type === NotificationType.GameTrophyAchieved) {
				this.action_model = new UserGameTrophy(data.action_resource_model);
				this.is_user_based = true;
			} else if (this.type === NotificationType.SiteTrophyAchieved) {
				this.action_model = new UserSiteTrophy(data.action_resource_model);
				this.is_user_based = true;
			} else if (this.type === NotificationType.CommunityUserNotification) {
				this.action_model = new CommunityUserNotification(data.action_resource_model);
				this.is_community_based = true;
			} else if (this.type === NotificationType.FiresideStart) {
				this.action_model = new Fireside(data.action_resource_model);
				this.is_user_based = true;
			} else if (this.type === NotificationType.FiresideStreamNotification) {
				this.action_model = new FiresideStreamNotification(data.action_resource_model);
			} else if (this.type === NotificationType.FiresideFeaturedInCommunity) {
				this.action_model = new FiresideCommunity(data.action_resource_model);
			} else if (this.type === NotificationType.QuestNotification) {
				this.action_model = new QuestNotification(data.action_resource_model);
			} else if (this.type === NotificationType.ChargedSticker) {
				this.action_model = new StickerPlacement(data.action_resource_model);
				this.is_user_based = true;
			} else if (this.type === NotificationType.SupporterMessage) {
				this.action_model = new SupporterAction(data.action_resource_model);
				this.is_user_based = true;
			} else if (this.type === NotificationType.PollEnded) {
				this.action_model = new Poll(data.action_resource_model);
			} else if (this.type === NotificationType.CreatorLevelUp) {
				this.action_model = new CreatorExperienceLevel(data.action_resource_model);
			} else if (this.type === NotificationType.UnlockedAvatarFrame) {
				this.action_model = new UserAvatarFrame(data.action_resource_model);
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

		$read() {
			// We want this to look like it happens immediately.
			this.viewed_on = Date.now();

			return this.$_save('/web/dash/activity/mark-read/' + this.id, 'notification', {
				detach: true,
			});
		}

		$unread() {
			// We want this to look like it happens immediately.
			this.viewed_on = null;

			return this.$_save('/web/dash/activity/mark-unread/' + this.id, 'notification', {
				detach: true,
			});
		}
	}
) {}

/**
 * Map of {@link NotificationFeedTypes} and their readable
 * translated labels.
 *
 * Only returns labels the user should be able to see.
 */
export function getNotificationFeedTypeLabels(user: User) {
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
