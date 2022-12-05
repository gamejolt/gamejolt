import { Router } from 'vue-router';
import { TrophyModal } from '../../app/components/trophy/modal/modal.service';
import type { RouteLocationDefinition } from '../../utils/router';
import { isKnownRoute } from '../../utils/router';
import { assertNever } from '../../utils/utils';
import { Collaborator } from '../collaborator/collaborator.model';
import { Comment, getCommentUrl } from '../comment/comment-model';
import { Community } from '../community/community.model';
import {
	CommunityUserNotification,
	NotificationType,
} from '../community/user-notification/user-notification.model';
import { Environment } from '../environment/environment.service';
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
import { showErrorGrowl } from '../growls/growls.service';
import { Mention } from '../mention/mention.model';
import { Model } from '../model/model.service';
import { Navigate } from '../navigate/navigate.service';
import { OrderItem } from '../order/item/item.model';
import { QuestNotification } from '../quest/quest-notification-model';
import { Sellable } from '../sellable/sellable.model';
import { StickerPlacement } from '../sticker/placement/placement.model';
import { Subscription } from '../subscription/subscription.model';
import { SupporterAction } from '../supporters/action.model';
import { Translate } from '../translate/translate.service';
import { UserFriendship } from '../user/friendship/friendship.model';
import { UserGameTrophy } from '../user/trophy/game-trophy.model';
import { UserSiteTrophy } from '../user/trophy/site-trophy.model';
import { UserBaseTrophy } from '../user/trophy/user-base-trophy.model';
import { User } from '../user/user.model';

function getRouteLocationForModel(
	model: Game | User | FiresidePost | Community | Fireside | QuestNotification
): RouteLocationDefinition | '' {
	if (model instanceof User) {
		return model.routeLocation;
	} else if (model instanceof Game) {
		return model.routeLocation;
	} else if (model instanceof FiresidePost) {
		return model.routeLocation;
	} else if (model instanceof Community) {
		return model.routeLocation;
	} else if (model instanceof Fireside) {
		return model.routeLocation;
	} else if (model instanceof QuestNotification) {
		return model.routeLocation;
	}
	return '';
}

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
		Notification.TYPE_QUEST_NOTIFICATION,
		Notification.TYPE_CHARGED_STICKER,
		Notification.TYPE_SUPPORTER_MESSAGE,
	];

	user_id!: number;
	type!: string;
	added_on!: number;
	viewed_on!: number | null;

	from_resource!: string;
	from_resource_id!: number;
	from_model?: User | Community;

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
		| SupporterAction;

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
			}
		}

		if (!this.viewed_on) {
			this.viewed_on = null;
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
		}

		// Keep memory clean after bootstrapping the models (the super
		// constructor will assign all data).
		delete (this as any).from_resource_model;
		delete (this as any).action_resource_model;
		delete (this as any).to_resource_model;
	}

	get routeLocation(): RouteLocationDefinition | '' {
		switch (this.type) {
			case Notification.TYPE_FRIENDSHIP_REQUEST:
			case Notification.TYPE_FRIENDSHIP_ACCEPT:
				return getRouteLocationForModel(this.from_model!);

			case Notification.TYPE_USER_FOLLOW:
				return getRouteLocationForModel(this.from_model!);

			case Notification.TYPE_GAME_RATING_ADD:
				return getRouteLocationForModel(this.from_model!);

			case Notification.TYPE_GAME_FOLLOW:
				return getRouteLocationForModel(this.from_model!);

			case Notification.TYPE_POST_FEATURED_IN_COMMUNITY:
				return getRouteLocationForModel(
					(this.action_model as FiresidePostCommunity).community
				);

			case Notification.TYPE_COMMUNITY_USER_NOTIFICATION:
				switch ((this.action_model as CommunityUserNotification).type) {
					case NotificationType.POSTS_MOVE:
					case NotificationType.POSTS_EJECT:
						return getRouteLocationForModel(this.to_model as FiresidePost);
					case NotificationType.FIRESIDES_EJECT:
						return getRouteLocationForModel(this.to_model as Fireside);
				}
				break;

			case Notification.TYPE_COLLABORATOR_INVITE:
				switch (this.to_resource) {
					case 'Game':
						return getRouteLocationForModel(this.to_model as Game);
					case 'Community':
						return getRouteLocationForModel(this.to_model as Community);
				}
				break;

			case Notification.TYPE_POST_ADD:
				return getRouteLocationForModel(this.action_model as FiresidePost);

			case Notification.TYPE_SELLABLE_SELL:
				return {
					name: 'home',
				};

			case Notification.TYPE_MENTION: {
				const mention = this.action_model as Mention;
				switch (mention.resource) {
					case 'Comment':
					case 'Forum_Post':
						// Pull through the "go" func below since we can't statically get it.
						return '';

					case 'Game':
						return getRouteLocationForModel(this.to_model as Game);

					case 'User':
						return getRouteLocationForModel(this.to_model as User);

					case 'Fireside_Post':
						return getRouteLocationForModel(this.to_model as FiresidePost);

					default:
						return assertNever(mention.resource);
				}
			}

			case Notification.TYPE_FIRESIDE_START:
				return getRouteLocationForModel(this.action_model as Fireside);

			case Notification.TYPE_FIRESIDE_STREAM_NOTIFICATION:
				return getRouteLocationForModel(
					(this.action_model as FiresideStreamNotification).fireside
				);

			case Notification.TYPE_FIRESIDE_FEATURED_IN_COMMUNITY:
				return getRouteLocationForModel(this.to_model as Fireside);

			case Notification.TYPE_QUEST_NOTIFICATION:
				return getRouteLocationForModel(this.action_model as QuestNotification);

			case Notification.TYPE_CHARGED_STICKER: {
				return getRouteLocationForModel(this.from_model!);
			}

			case Notification.TYPE_SUPPORTER_MESSAGE: {
				return getRouteLocationForModel(this.from_model!);
			}
		}

		// Must pull asynchronously when they click on the notification.
		return '';
	}

	get feedType() {
		if (Notification.ACTIVITY_FEED_TYPES.indexOf(this.type) !== -1) {
			return 'activity';
		} else if (Notification.NOTIFICATION_FEED_TYPES.indexOf(this.type) !== -1) {
			return 'notifications';
		}
		return '';
	}

	async go(router: Router) {
		const gotoLocation = this.routeLocation;
		if (gotoLocation !== '') {
			router.push(gotoLocation);
		} else if (
			this.type === Notification.TYPE_GAME_TROPHY_ACHIEVED ||
			this.type === Notification.TYPE_SITE_TROPHY_ACHIEVED
		) {
			if (this.action_model instanceof UserBaseTrophy) {
				TrophyModal.show(this.action_model);
			}
		} else if (
			this.type === Notification.TYPE_COMMENT_ADD ||
			this.type === Notification.TYPE_COMMENT_ADD_OBJECT_OWNER ||
			this.type === Notification.TYPE_MENTION ||
			this.type === Notification.TYPE_FORUM_POST_ADD
		) {
			// Need to fetch the URL first.
			let url: string;
			let model = this.action_model;

			if (this.action_model instanceof Mention) {
				if (this.action_model.comment) {
					model = this.action_model.comment;
				} else if (this.action_model.forum_post) {
					model = this.action_model.forum_post;
				} else if (this.action_model.fireside_post) {
					model = this.action_model.fireside_post;
				} else {
					throw new Error(`Invalid mention model.`);
				}
			}

			try {
				if (model instanceof Comment) {
					url = await getCommentUrl(model.id);
				} else if (model instanceof ForumPost) {
					url = await ForumPost.getPostUrl(model.id);
				} else if (model instanceof FiresidePost) {
					url = model.url;
				} else {
					throw new Error('Invalid type.');
				}

				// If we're going to a URL within this domain, then we want to strip off the domain stuff
				// and go to the URL. Otherwise we need to do a full-page change to the domain/url.
				const search = Environment.baseUrl;
				if (url.search(search) === 0) {
					url = url.replace(search, '');

					if (!isKnownRoute(router, url)) {
						throw new Error(
							`Could not resolve notification url to a vue route. Notification id: ${this.id}, Url: ${url}`
						);
					}

					router.push(url);
				} else {
					Navigate.gotoExternal(url);
				}
			} catch (e) {
				console.error(e);
				showErrorGrowl(Translate.$gettext(`Couldn't go to notification.`));
			}
		}
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
