import { Router } from 'vue-router';
import { Comment, getCommentUrl } from '../../../../../_common/comment/comment-model';
import { Community } from '../../../../../_common/community/community.model';
import {
	CommunityUserNotification,
	NotificationType,
} from '../../../../../_common/community/user-notification/user-notification.model';
import { Environment } from '../../../../../_common/environment/environment.service';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import { FiresidePostCommunity } from '../../../../../_common/fireside/post/community/community.model';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { FiresideStreamNotification } from '../../../../../_common/fireside/stream-notification/stream-notification.model';
import { ForumPost } from '../../../../../_common/forum/post/post.model';
import { Game } from '../../../../../_common/game/game.model';
import { showErrorGrowl } from '../../../../../_common/growls/growls.service';
import { Mention } from '../../../../../_common/mention/mention.model';
import { Navigate } from '../../../../../_common/navigate/navigate.service';
import { Notification } from '../../../../../_common/notification/notification-model';
import { QuestNotification } from '../../../../../_common/quest/quest-notification-model';
import { SupporterAction } from '../../../../../_common/supporters/action.model';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { TrophyModal } from '../../../../../_common/trophy/modal/modal.service';
import { UserBaseTrophy } from '../../../../../_common/user/trophy/user-base-trophy.model';
import { User } from '../../../../../_common/user/user.model';
import { RouteLocationDefinition, isKnownRoute } from '../../../../../utils/router';
import { assertNever } from '../../../../../utils/utils';
import { AppStore } from '../../../../store/index';
import { routeDashAccountEdit } from '../../../../views/dashboard/account/edit/edit.route';
import { SupporterMessageModal } from '../../../../views/dashboard/supporters/message/modal.service';
import { routeDashSupporters } from '../../../../views/dashboard/supporters/supporters.route';

function getRouteLocationForModel(
	model: Game | User | FiresidePost | Community | Fireside | QuestNotification | undefined
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
	}
	return '';
}

export function getNotificationRouteLocation(
	notification: Notification
): RouteLocationDefinition | '' {
	const { type, action_model, from_model, to_model, to_resource, action_resource_id } =
		notification;

	switch (type) {
		case Notification.TYPE_FRIENDSHIP_REQUEST:
		case Notification.TYPE_FRIENDSHIP_ACCEPT:
			return getRouteLocationForModel(from_model);

		case Notification.TYPE_USER_FOLLOW:
			return getRouteLocationForModel(from_model);

		case Notification.TYPE_GAME_RATING_ADD:
			return getRouteLocationForModel(from_model);

		case Notification.TYPE_GAME_FOLLOW:
			return getRouteLocationForModel(from_model);

		case Notification.TYPE_POST_FEATURED_IN_COMMUNITY:
			return getRouteLocationForModel((action_model as FiresidePostCommunity).community);

		case Notification.TYPE_COMMUNITY_USER_NOTIFICATION:
			switch ((action_model as CommunityUserNotification).type) {
				case NotificationType.POSTS_MOVE:
				case NotificationType.POSTS_EJECT:
					return getRouteLocationForModel(to_model as FiresidePost);
				case NotificationType.FIRESIDES_EJECT:
					return getRouteLocationForModel(to_model as Fireside);
			}
			break;

		case Notification.TYPE_COLLABORATOR_INVITE:
			switch (to_resource) {
				case 'Game':
					return getRouteLocationForModel(to_model as Game);
				case 'Community':
					return getRouteLocationForModel(to_model as Community);
			}
			break;

		case Notification.TYPE_POST_ADD:
			return getRouteLocationForModel(action_model as FiresidePost);

		case Notification.TYPE_SELLABLE_SELL:
			return {
				name: 'home',
			};

		case Notification.TYPE_MENTION: {
			const mention = action_model as Mention;
			switch (mention.resource) {
				case 'Comment':
				case 'Forum_Post':
					// Pull through the "go" func below since we can't statically get it.
					return '';

				case 'Game':
					return getRouteLocationForModel(to_model as Game);

				case 'User':
					return getRouteLocationForModel(to_model as User);

				case 'Fireside_Post':
					return getRouteLocationForModel(to_model as FiresidePost);

				default:
					return assertNever(mention.resource);
			}
		}

		case Notification.TYPE_FIRESIDE_START:
			return getRouteLocationForModel(action_model as Fireside);

		case Notification.TYPE_FIRESIDE_STREAM_NOTIFICATION:
			return getRouteLocationForModel((action_model as FiresideStreamNotification).fireside);

		case Notification.TYPE_FIRESIDE_FEATURED_IN_COMMUNITY:
			return getRouteLocationForModel(to_model as Fireside);

		case Notification.TYPE_QUEST_NOTIFICATION:
			// Handled in the [go] function.
			return '';

		case Notification.TYPE_CHARGED_STICKER: {
			return routeDashSupporters;
		}

		case Notification.TYPE_SUPPORTER_MESSAGE: {
			// Messages might have their height cropped in the notification
			// feed. Don't return a location here, we'll instead show a
			// modal in the `go` function.
			return '';
		}

		case Notification.TYPE_POLL_ENDED: {
			if (from_model) {
				return getRouteLocationForModel(from_model);
			}
			break;
		}

		case Notification.TYPE_UNLOCKED_AVATAR_FRAME: {
			return {
				name: routeDashAccountEdit.name,
				query: { avatar: action_resource_id },
			};
		}
	}

	// Must pull asynchronously when they click on the notification.
	return '';
}

export async function gotoNotification(
	notification: Notification,
	{ router, appStore }: { router: Router; appStore: AppStore }
) {
	const { id, type, action_model } = notification;

	const routeLocation = getNotificationRouteLocation(notification);
	if (routeLocation !== '') {
		router.push(routeLocation);
		return;
	}

	if (
		type === Notification.TYPE_GAME_TROPHY_ACHIEVED ||
		type === Notification.TYPE_SITE_TROPHY_ACHIEVED
	) {
		if (action_model instanceof UserBaseTrophy) {
			TrophyModal.show(action_model);
		}
	} else if (
		type === Notification.TYPE_COMMENT_ADD ||
		type === Notification.TYPE_COMMENT_ADD_OBJECT_OWNER ||
		type === Notification.TYPE_MENTION ||
		type === Notification.TYPE_FORUM_POST_ADD
	) {
		// Need to fetch the URL first.
		let url: string;
		let model = action_model;

		if (action_model instanceof Mention) {
			if (action_model.comment) {
				model = action_model.comment;
			} else if (action_model.forum_post) {
				model = action_model.forum_post;
			} else if (action_model.fireside_post) {
				model = action_model.fireside_post;
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
						`Could not resolve notification url to a vue route. Notification id: ${id}, Url: ${url}`
					);
				}

				router.push(url);
			} else {
				Navigate.gotoExternal(url);
			}
		} catch (e) {
			console.error(e);
			showErrorGrowl($gettext(`Couldn't go to notification.`));
		}
	} else if (type === Notification.TYPE_SUPPORTER_MESSAGE) {
		if (action_model instanceof SupporterAction) {
			SupporterMessageModal.show(action_model);
		}
	} else if (type === Notification.TYPE_QUEST_NOTIFICATION) {
		if (action_model instanceof QuestNotification) {
			const { quest_id } = action_model;

			const { toggleLeftPane, visibleLeftPane, getQuestStore } = appStore;
			const { activeQuest } = getQuestStore();

			if (visibleLeftPane.value !== 'quests') {
				toggleLeftPane('quests');
			}

			activeQuest.value = quest_id;
		}
	}
}
