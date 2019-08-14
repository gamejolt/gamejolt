import VueRouter, { RawLocation } from 'vue-router';
import { Community } from '../../components/community/community.model';
import { EventItem } from '../../components/event-item/event-item.model';
import { assertNever } from '../../utils/utils';
import { currency } from '../../vue/filters/currency';
import { Api } from '../api/api.service';
import { Collaborator } from '../collaborator/collaborator.model';
import { Comment, getCommentUrl } from '../comment/comment-model';
import { CommentVideoModal } from '../comment/video/modal/modal.service';
import { CommentVideo } from '../comment/video/video-model';
import { Environment } from '../environment/environment.service';
import { FiresidePost } from '../fireside/post/post-model';
import { ForumPost } from '../forum/post/post.model';
import { ForumTopic } from '../forum/topic/topic.model';
import { GameLibraryGame } from '../game-library/game/game.model';
import { Game } from '../game/game.model';
import { GameRating } from '../game/rating/rating.model';
import { Growls } from '../growls/growls.service';
import { Mention } from '../mention/mention.model';
import { Model } from '../model/model.service';
import { Navigate } from '../navigate/navigate.service';
import { OrderItem } from '../order/item/item.model';
import { Sellable } from '../sellable/sellable.model';
import { Subscription } from '../subscription/subscription.model';
import { Translate } from '../translate/translate.service';
import { UserFriendship } from '../user/friendship/friendship.model';
import { User } from '../user/user.model';

function getRouteLocationForModel(model: Game | User | FiresidePost | Community): RawLocation {
	if (model instanceof User) {
		return model.url;
	} else if (model instanceof Game) {
		return model.routeLocation;
	} else if (model instanceof FiresidePost && !!model.game) {
		return model.routeLocation;
	} else if (model instanceof Community) {
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
	static TYPE_SELLABLE_SELL = 'sellable-sell';
	static TYPE_USER_FOLLOW = 'user-follow';
	static TYPE_COLLABORATOR_INVITE = 'collaborator-invite';
	static TYPE_MENTION = 'mention';
	static TYPE_COMMENT_VIDEO_ADD = 'comment-video-add';

	static ACTIVITY_FEED_TYPES = [
		EventItem.TYPE_POST_ADD,
		EventItem.TYPE_COMMENT_VIDEO_ADD,
		EventItem.TYPE_GAME_PUBLISH,
	];

	static NOTIFICATION_FEED_TYPES = [
		Notification.TYPE_COMMENT_ADD,
		Notification.TYPE_COMMENT_ADD_OBJECT_OWNER,
		Notification.TYPE_FORUM_POST_ADD,
		Notification.TYPE_FRIENDSHIP_ACCEPT,
		Notification.TYPE_GAME_RATING_ADD,
		Notification.TYPE_GAME_FOLLOW,
		Notification.TYPE_SELLABLE_SELL,
		Notification.TYPE_USER_FOLLOW,
		Notification.TYPE_MENTION,
		Notification.TYPE_COLLABORATOR_INVITE,
	];

	user_id!: number;
	type!: string;
	added_on!: number;
	viewed_on!: number | null;

	from_resource!: string;
	from_resource_id!: number;
	from_model?: User;

	action_resource!: string;
	action_resource_id!: number;
	action_model!:
		| Comment
		| ForumPost
		| UserFriendship
		| GameRating
		| GameLibraryGame
		| FiresidePost
		| OrderItem
		| Subscription
		| Collaborator
		| Mention
		| CommentVideo;

	to_resource!: string | null;
	to_resource_id!: number | null;
	to_model?: Game | User | FiresidePost | ForumTopic | Sellable | Community;

	// Generated in constructor.
	is_user_based = false;
	is_game_based = false;

	// For feeds.
	scroll_id?: string;

	constructor(data: any = {}) {
		super(data);

		if (data.from_resource === 'User' && data.from_resource_id) {
			this.from_model = new User(data.from_resource_model);
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
		} else if (this.type === Notification.TYPE_COMMENT_VIDEO_ADD) {
			this.action_model = new CommentVideo(data.action_resource_model);
			this.is_user_based = true;
		}

		// Keep memory clean after bootstrapping the models.
		const that: any = this;
		delete that['from_resource_model'];
		delete that['action_resource_model'];
		delete that['to_resource_model'];
	}

	static fetchNotificationsCount() {
		return Api.sendRequest('/web/dash/activity/count', null, { detach: true });
	}

	get routeLocation(): RawLocation {
		switch (this.type) {
			case Notification.TYPE_FRIENDSHIP_REQUEST:
			case Notification.TYPE_FRIENDSHIP_ACCEPT:
				return getRouteLocationForModel(this.from_model!);

			case Notification.TYPE_USER_FOLLOW:
				return getRouteLocationForModel(this.from_model!);

			case Notification.TYPE_GAME_RATING_ADD:
				return getRouteLocationForModel(this.from_model as User);

			case Notification.TYPE_GAME_FOLLOW:
				return getRouteLocationForModel(this.from_model!);

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

	async go(router: VueRouter) {
		if (this.routeLocation) {
			router.push(this.routeLocation);
		} else if (this.type === Notification.TYPE_COMMENT_VIDEO_ADD) {
			if (this.action_model instanceof CommentVideo) {
				CommentVideoModal.show(this.action_model);
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
					router.push(url);
				} else {
					Navigate.gotoExternal(url);
				}
			} catch (e) {
				console.error(e);
				Growls.error(Translate.$gettext(`Couldn't go to notification.`));
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

function getSubjectTranslationValue(notification: Notification) {
	if (notification.is_user_based) {
		if (notification.from_model) {
			return (
				notification.from_model.display_name +
				' (@' +
				notification.from_model.username +
				')'
			);
		} else {
			return 'Someone';
		}
	} else if (notification.is_game_based && notification.to_model instanceof Game) {
		return notification.to_model.title;
	}
	return '';
}

function getTranslationValues(notification: Notification) {
	const subject = getSubjectTranslationValue(notification);

	if (notification.to_model instanceof Game || notification.to_model instanceof ForumTopic) {
		return {
			subject: subject,
			object: notification.to_model.title,
		};
	} else if (notification.to_model instanceof Community) {
		return {
			subject: subject,
			object: notification.to_model.name,
		};
	} else if (notification.to_model instanceof FiresidePost) {
		return {
			subject: subject,
			object: notification.to_model.lead_snippet,
		};
	} else if (notification.to_model instanceof User) {
		if (
			notification.from_model instanceof User &&
			notification.from_model.id === notification.to_model.id
		) {
			return {
				subject: subject,
				object: 'them',
			};
		} else {
			return {
				subject: subject,
				object:
					notification.to_model.display_name +
					' (@' +
					notification.to_model.username +
					')',
			};
		}
	}

	return {
		subject: subject,
	};
}

/**
 * @param plaintext You can set this to `true` to return strings without any
 * HTML.
 */
export function getNotificationText(notification: Notification, plaintext = false) {
	// Super hack time!
	function _process(text: string) {
		if (plaintext) {
			return text
				.replace(/<em>/g, '')
				.replace(/<\/em>/g, '')
				.replace(/<b>/g, '')
				.replace(/<\/b>/g, '');
		}
		return text;
	}

	switch (notification.type) {
		case Notification.TYPE_POST_ADD: {
			let gameTitle = '';
			let postTitle = '';
			if (notification.to_model instanceof Game) {
				gameTitle = notification.to_model.title + ' - ';
			}
			if (notification.action_model instanceof FiresidePost) {
				postTitle = notification.action_model.lead_snippet;
			}
			return gameTitle + postTitle;
		}

		case Notification.TYPE_COMMENT_VIDEO_ADD: {
			let videoTitle = '';
			if (notification.action_model instanceof CommentVideo) {
				videoTitle = notification.action_model.title;
			}

			return videoTitle;
		}

		case Notification.TYPE_COMMENT_ADD_OBJECT_OWNER: {
			if (notification.to_model instanceof User) {
				return _process(
					Translate.$gettextInterpolate(
						`<em>%{ subject }</em> shouted at you!`,
						getTranslationValues(notification)
					)
				);
			} else {
				return _process(
					Translate.$gettextInterpolate(
						`<em>%{ subject }</em> commented on <b>%{ object }</b>.`,
						getTranslationValues(notification)
					)
				);
			}
		}

		case Notification.TYPE_COMMENT_ADD: {
			if (notification.to_model instanceof User) {
				return _process(
					Translate.$gettextInterpolate(
						`<em>%{ subject }</em> replied to your shout to <b>%{ object }</b>.`,
						getTranslationValues(notification)
					)
				);
			} else {
				return _process(
					Translate.$gettextInterpolate(
						`<em>%{ subject }</em> replied to your comment on <b>%{ object }</b>.`,
						getTranslationValues(notification)
					)
				);
			}
		}

		case Notification.TYPE_FORUM_POST_ADD: {
			return _process(
				Translate.$gettextInterpolate(
					`<em>%{ subject }</em> posted a new forum post to <b>%{ object }</b>.`,
					getTranslationValues(notification)
				)
			);
		}

		case Notification.TYPE_FRIENDSHIP_REQUEST: {
			return _process(
				Translate.$gettextInterpolate(
					`<em>%{ subject }</em> sent you a friend request.`,
					getTranslationValues(notification)
				)
			);
		}

		case Notification.TYPE_FRIENDSHIP_ACCEPT: {
			return _process(
				Translate.$gettextInterpolate(
					`<em>%{ subject }</em> accepted your friend request.`,
					getTranslationValues(notification)
				)
			);
		}

		case Notification.TYPE_GAME_RATING_ADD: {
			return _process(
				Translate.$gettextInterpolate(
					`<em>%{ subject }</em> liked <b>%{ object }</b>.`,
					getTranslationValues(notification)
				)
			);
		}

		case Notification.TYPE_GAME_FOLLOW: {
			return _process(
				Translate.$gettextInterpolate(
					`<em>%{ subject }</em> followed <b>%{ object }</b>.`,
					getTranslationValues(notification)
				)
			);
		}

		case Notification.TYPE_SELLABLE_SELL: {
			const sellable = notification.to_model as Sellable;
			const orderItem = notification.action_model as OrderItem;
			const translationValues = {
				object: sellable.title,
				amount: currency(orderItem.amount),
				subject: getSubjectTranslationValue(notification),
			};

			return _process(
				Translate.$gettextInterpolate(
					`<em>%{ subject }</em> bought a package in <b>%{ object }</b> for %{ amount }.`,
					translationValues
				)
			);
		}

		case Notification.TYPE_USER_FOLLOW: {
			return _process(
				Translate.$gettextInterpolate(
					`<em>%{ subject }</em> followed you.`,
					getTranslationValues(notification)
				)
			);
		}

		case Notification.TYPE_COLLABORATOR_INVITE: {
			switch (notification.to_resource) {
				case 'Game':
					return _process(
						Translate.$gettextInterpolate(
							`<em>%{ subject }</em> invited you to collaborate on the game <b>%{ object }</b>.`,
							getTranslationValues(notification)
						)
					);
				case 'Community':
					return _process(
						Translate.$gettextInterpolate(
							`<em>%{ subject }</em> invited you to collaborate on the <b>%{ object }</b> community.`,
							getTranslationValues(notification)
						)
					);
			}
			break;
		}

		case Notification.TYPE_MENTION: {
			const mention = notification.action_model as Mention;

			switch (mention.resource) {
				case 'Comment': {
					if (notification.to_model instanceof Game) {
						return _process(
							Translate.$gettextInterpolate(
								`<em>%{ subject }</em> mentioned you in a comment on the game <b>%{ object }</b>.`,
								{
									object: notification.to_model.title,
									subject: getSubjectTranslationValue(notification),
								}
							)
						);
					} else if (notification.to_model instanceof FiresidePost) {
						return _process(
							Translate.$gettextInterpolate(
								`<em>%{ subject }</em> mentioned you in a comment on the post <b>%{ object }</b>.`,
								{
									object: notification.to_model.lead_snippet,
									subject: getSubjectTranslationValue(notification),
								}
							)
						);
					} else if (notification.to_model instanceof User) {
						return _process(
							Translate.$gettextInterpolate(
								`<em>%{ subject }</em> mentioned you in a shout to @<b>%{ object }</b>.`,
								{
									object: notification.to_model.username,
									subject: getSubjectTranslationValue(notification),
								}
							)
						);
					}
					break;
				}

				case 'Game': {
					return _process(
						Translate.$gettextInterpolate(
							`<em>%{ subject }</em> mentioned you in the game <b>%{ object }</b>.`,
							{
								object: (notification.to_model as Game).title,
								subject: getSubjectTranslationValue(notification),
							}
						)
					);
				}

				case 'User': {
					return _process(
						Translate.$gettextInterpolate(
							`<em>%{ subject }</em> mentioned you in their user bio.`,
							getTranslationValues(notification)
						)
					);
				}

				case 'Fireside_Post': {
					return _process(
						Translate.$gettextInterpolate(
							`<em>%{ subject }</em> mentioned you in the post <b>%{ object }</b>.`,
							{
								object: (notification.to_model as FiresidePost).lead_snippet,
								subject: getSubjectTranslationValue(notification),
							}
						)
					);
				}

				case 'Forum_Post': {
					return _process(
						Translate.$gettextInterpolate(
							`<em>%{ subject }</em> mentioned you in a forum post to <b>%{ object }</b>.`,
							{
								object: (notification.to_model as ForumTopic).title,
								subject: getSubjectTranslationValue(notification),
							}
						)
					);
				}

				default: {
					return assertNever(mention.resource);
				}
			}
		}
	}
}
