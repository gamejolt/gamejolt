import { Collaborator } from '../collaborator/collaborator.model';
import { Comment } from '../comment/comment-model';
import { Community } from '../community/community.model';
import { CommunityUserNotification } from '../community/user-notification/user-notification.model';
import { CreatorExperienceLevel } from '../creator/experience/level.model';
import { EventItem } from '../event-item/event-item.model';
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
import { Model } from '../model/model.service';
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

export class Notification extends Model {
	static TYPE_COMMENT_ADD = 'comment-add';
	static TYPE_COMMENT_ADD_OBJECT_OWNER = 'comment-add-object-owner';
	static TYPE_FORUM_POST_ADD = 'forum-post-add';
	static TYPE_FRIENDSHIP_REQUEST = 'friendship-request';
	static TYPE_FRIENDSHIP_ACCEPT = 'friendship-accept';
	static TYPE_FRIENDSHIP_CANCEL = 'friendship-cancel';
	static TYPE_GAME_RATING_ADD = 'game-rating-add';
	static TYPE_GAME_FOLLOW = 'game-follow';
	static TYPE_POST_ADD = 'post-add';
	static TYPE_POST_FEATURED_IN_COMMUNITY = 'post-featured-in-community';
	static TYPE_SELLABLE_SELL = 'sellable-sell';
	static TYPE_USER_FOLLOW = 'user-follow';
	static TYPE_COLLABORATOR_INVITE = 'collaborator-invite';
	static TYPE_MENTION = 'mention';
	static TYPE_GAME_TROPHY_ACHIEVED = 'game-trophy-achieved';
	static TYPE_SITE_TROPHY_ACHIEVED = 'site-trophy-achieved';
	static TYPE_COMMUNITY_USER_NOTIFICATION = 'community-user-notification';
	static TYPE_FIRESIDE_START = 'fireside-start';
	static TYPE_FIRESIDE_STREAM_NOTIFICATION = 'fireside-stream-notification';
	static TYPE_FIRESIDE_FEATURED_IN_COMMUNITY = 'fireside-featured-in-community';
	static TYPE_QUEST_NOTIFICATION = 'quest-notification';
	static TYPE_CHARGED_STICKER = 'charged-sticker';
	static TYPE_SUPPORTER_MESSAGE = 'supporter-message';
	static TYPE_POLL_ENDED = 'poll-ended';
	static TYPE_CREATOR_LEVEL_UP = 'creator-level-up';
	static TYPE_UNLOCKED_AVATAR_FRAME = 'unlocked-avatar-frame';

	static ACTIVITY_FEED_TYPES = [EventItem.TYPE_POST_ADD];

	static NOTIFICATION_FEED_TYPES = [
		Notification.TYPE_COMMENT_ADD,
		Notification.TYPE_COMMENT_ADD_OBJECT_OWNER,
		Notification.TYPE_FORUM_POST_ADD,
		Notification.TYPE_FRIENDSHIP_ACCEPT,
		Notification.TYPE_GAME_RATING_ADD,
		Notification.TYPE_GAME_FOLLOW,
		Notification.TYPE_POST_FEATURED_IN_COMMUNITY,
		Notification.TYPE_SELLABLE_SELL,
		Notification.TYPE_USER_FOLLOW,
		Notification.TYPE_MENTION,
		Notification.TYPE_COLLABORATOR_INVITE,
		Notification.TYPE_GAME_TROPHY_ACHIEVED,
		Notification.TYPE_SITE_TROPHY_ACHIEVED,
		Notification.TYPE_COMMUNITY_USER_NOTIFICATION,
		Notification.TYPE_FIRESIDE_FEATURED_IN_COMMUNITY,
		Notification.TYPE_CHARGED_STICKER,
		Notification.TYPE_SUPPORTER_MESSAGE,
		Notification.TYPE_POLL_ENDED,
		Notification.TYPE_CREATOR_LEVEL_UP,
		Notification.TYPE_UNLOCKED_AVATAR_FRAME,
	];

	user_id!: number;
	type!: string;
	is_notification_feed_item!: boolean;
	added_on!: number;
	viewed_on!: number | null;

	from_resource!: string;
	from_resource_id!: number;
	from_model?: User | Community | FiresidePost;

	action_resource!: string;
	action_resource_id!: number;
	action_model!:
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

	to_resource!: string | null;
	to_resource_id!: number | null;
	to_model?: Game | User | FiresidePost | ForumTopic | Sellable | Community | Fireside;

	// Generated in constructor.
	is_user_based = false;
	is_game_based = false;
	is_community_based = false;

	// For feeds.
	scroll_id?: string;

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

		if (this.type === Notification.TYPE_COMMENT_ADD) {
			this.action_model = new Comment(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_COMMENT_ADD_OBJECT_OWNER) {
			this.action_model = new Comment(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_FORUM_POST_ADD) {
			this.action_model = new ForumPost(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_FRIENDSHIP_REQUEST) {
			this.action_model = new UserFriendship(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_FRIENDSHIP_ACCEPT) {
			this.action_model = new UserFriendship(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_GAME_RATING_ADD) {
			this.action_model = new GameRating(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_GAME_FOLLOW) {
			this.action_model = new GameLibraryGame(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_POST_ADD) {
			this.action_model = new FiresidePost(data.action_resource_model);
			this.is_game_based = this.to_model instanceof Game;
		} else if (this.type === Notification.TYPE_POST_FEATURED_IN_COMMUNITY) {
			this.action_model = new FiresidePostCommunity(data.action_resource_model);
		} else if (this.type === Notification.TYPE_SELLABLE_SELL) {
			this.action_model = new OrderItem(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_USER_FOLLOW) {
			this.action_model = new Subscription(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_COLLABORATOR_INVITE) {
			this.action_model = new Collaborator(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_MENTION) {
			this.action_model = new Mention(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_GAME_TROPHY_ACHIEVED) {
			this.action_model = new UserGameTrophy(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_SITE_TROPHY_ACHIEVED) {
			this.action_model = new UserSiteTrophy(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_COMMUNITY_USER_NOTIFICATION) {
			this.action_model = new CommunityUserNotification(data.action_resource_model);
			this.is_community_based = true;
		} else if (this.type === Notification.TYPE_FIRESIDE_START) {
			this.action_model = new Fireside(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_FIRESIDE_STREAM_NOTIFICATION) {
			this.action_model = new FiresideStreamNotification(data.action_resource_model);
		} else if (this.type === Notification.TYPE_FIRESIDE_FEATURED_IN_COMMUNITY) {
			this.action_model = new FiresideCommunity(data.action_resource_model);
		} else if (this.type === Notification.TYPE_QUEST_NOTIFICATION) {
			this.action_model = new QuestNotification(data.action_resource_model);
		} else if (this.type === Notification.TYPE_CHARGED_STICKER) {
			this.action_model = new StickerPlacement(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_SUPPORTER_MESSAGE) {
			this.action_model = new SupporterAction(data.action_resource_model);
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_POLL_ENDED) {
			this.action_model = new Poll(data.action_resource_model);
		} else if (this.type === Notification.TYPE_CREATOR_LEVEL_UP) {
			this.action_model = new CreatorExperienceLevel(data.action_resource_model);
		} else if (this.type === Notification.TYPE_UNLOCKED_AVATAR_FRAME) {
			this.action_model = new UserAvatarFrame(data.action_resource_model);
		}

		// Keep memory clean after bootstrapping the models (the super
		// constructor will assign all data).
		delete (this as any).from_resource_model;
		delete (this as any).action_resource_model;
		delete (this as any).to_resource_model;
	}

	get feedType() {
		if (Notification.ACTIVITY_FEED_TYPES.indexOf(this.type) !== -1) {
			return 'activity';
		} else if (Notification.NOTIFICATION_FEED_TYPES.indexOf(this.type) !== -1) {
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

Model.create(Notification);

/**
 * Map of {@link Notification.NOTIFICATION_FEED_TYPES} and their readable
 * translated labels.
 *
 * Only returns labels the user should be able to see.
 */
export function getNotificationFeedTypeLabels(user: User) {
	const labels = {
		[Notification.TYPE_COMMENT_ADD]: $gettext(`Comment replies`),
		[Notification.TYPE_COMMENT_ADD_OBJECT_OWNER]: $gettext(`Comments on your content`),
		[Notification.TYPE_FORUM_POST_ADD]: $gettext(`Forum posts`),
		[Notification.TYPE_FRIENDSHIP_ACCEPT]: $gettext(`Accepted friend requests`),
		[Notification.TYPE_POST_FEATURED_IN_COMMUNITY]: $gettext(`Post featured`),
		[Notification.TYPE_USER_FOLLOW]: $gettext(`Follows`),
		[Notification.TYPE_MENTION]: $gettext(`Mentions`),
		[Notification.TYPE_COLLABORATOR_INVITE]: $gettext(`Collaborator invites`),
		[Notification.TYPE_GAME_TROPHY_ACHIEVED]: $gettext(`Game trophies`),
		[Notification.TYPE_SITE_TROPHY_ACHIEVED]: $gettext(`Site trophies`),
		[Notification.TYPE_COMMUNITY_USER_NOTIFICATION]: $gettext(`Community actions`),
		[Notification.TYPE_FIRESIDE_FEATURED_IN_COMMUNITY]: $gettext(
			`Community featured firesides`
		),
		[Notification.TYPE_QUEST_NOTIFICATION]: $gettext(`Quests`),
		[Notification.TYPE_SUPPORTER_MESSAGE]: $gettext(`Creator thank-you messages`),
		[Notification.TYPE_POLL_ENDED]: $gettext(`Polls`),
	};

	// Creator notification types.
	if (user.is_creator) {
		labels[Notification.TYPE_CHARGED_STICKER] = $gettext(`Charged stickers`);
		labels[Notification.TYPE_CREATOR_LEVEL_UP] = $gettext(`Creator level ups`);
	}

	// Game developer notification types.
	if (user.type === UserType.Developer) {
		labels[Notification.TYPE_GAME_RATING_ADD] = $gettext(`Game ratings`);
		labels[Notification.TYPE_GAME_FOLLOW] = $gettext(`Game follows`);
		labels[Notification.TYPE_SELLABLE_SELL] = $gettext(`Sales`);
	}

	return labels;
}
