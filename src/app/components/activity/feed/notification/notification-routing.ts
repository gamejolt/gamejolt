import { Router } from 'vue-router';
import { CommentModel, getCommentUrl } from '../../../../../_common/comment/comment-model';
import { CommunityModel } from '../../../../../_common/community/community.model';
import {
	CommunityUserNotificationModel,
	CommunityUserNotificationType,
} from '../../../../../_common/community/user-notification/user-notification.model';
import { CreatorExperienceLevelUpModal } from '../../../../../_common/creator/experience/level-up-modal/modal.service';
import { CreatorExperienceLevelModel } from '../../../../../_common/creator/experience/level.model';
import { Environment } from '../../../../../_common/environment/environment.service';
import { FiresideModel } from '../../../../../_common/fireside/fireside.model';
import { FiresidePostCommunityModel } from '../../../../../_common/fireside/post/community/community.model';
import { FiresidePostModel } from '../../../../../_common/fireside/post/post-model';
import { FiresideStreamNotificationModel } from '../../../../../_common/fireside/stream-notification/stream-notification.model';
import { ForumPostModel, getForumPostUrl } from '../../../../../_common/forum/post/post.model';
import { GameModel } from '../../../../../_common/game/game.model';
import { showErrorGrowl } from '../../../../../_common/growls/growls.service';
import { MentionModel } from '../../../../../_common/mention/mention.model';
import { Navigate } from '../../../../../_common/navigate/navigate.service';
import {
	NotificationModel,
	NotificationType,
} from '../../../../../_common/notification/notification-model';
import { QuestNotificationModel } from '../../../../../_common/quest/quest-notification-model';
import { SupporterActionModel } from '../../../../../_common/supporters/action.model';
import { SupporterMessageModal } from '../../../../../_common/supporters/message/modal.service';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { TrophyModal } from '../../../../../_common/trophy/modal/modal.service';
import { UserBaseTrophyModel } from '../../../../../_common/user/trophy/user-base-trophy.model';
import { UserModel } from '../../../../../_common/user/user.model';
import { RouteLocationDefinition, isKnownRoute } from '../../../../../utils/router';
import { assertNever } from '../../../../../utils/utils';
import { AppStore } from '../../../../store/index';
import { routeDashAccountEdit } from '../../../../views/dashboard/account/edit/edit.route';
import { routeDashSupporters } from '../../../../views/dashboard/supporters/supporters.route';

function getRouteLocationForModel(
	model:
		| GameModel
		| UserModel
		| FiresidePostModel
		| CommunityModel
		| FiresideModel
		| QuestNotificationModel
		| undefined
): RouteLocationDefinition | '' {
	if (model instanceof UserModel) {
		return model.routeLocation;
	} else if (model instanceof GameModel) {
		return model.routeLocation;
	} else if (model instanceof FiresidePostModel) {
		return model.routeLocation;
	} else if (model instanceof CommunityModel) {
		return model.routeLocation;
	} else if (model instanceof FiresideModel) {
		return model.routeLocation;
	}
	return '';
}

export function getNotificationRouteLocation(
	notification: NotificationModel
): RouteLocationDefinition | '' {
	const { type, action_model, from_model, to_model, to_resource, action_resource_id } =
		notification;

	switch (type) {
		case NotificationType.FriendshipRequest:
		case NotificationType.FriendshipAccept:
			return getRouteLocationForModel(from_model);

		case NotificationType.UserFollow:
			return getRouteLocationForModel(from_model);

		case NotificationType.GameRatingAdd:
			return getRouteLocationForModel(from_model);

		case NotificationType.GameFollow:
			return getRouteLocationForModel(from_model);

		case NotificationType.PostFeaturedInCommunity:
			return getRouteLocationForModel((action_model as FiresidePostCommunityModel).community);

		case NotificationType.CommunityUserNotification:
			switch ((action_model as CommunityUserNotificationModel).type) {
				case CommunityUserNotificationType.POSTS_MOVE:
				case CommunityUserNotificationType.POSTS_EJECT:
					return getRouteLocationForModel(to_model as FiresidePostModel);
				case CommunityUserNotificationType.FIRESIDES_EJECT:
					return getRouteLocationForModel(to_model as FiresideModel);
			}
			break;

		case NotificationType.CollaboratorInvite:
			switch (to_resource) {
				case 'Game':
					return getRouteLocationForModel(to_model as GameModel);
				case 'Community':
					return getRouteLocationForModel(to_model as CommunityModel);
			}
			break;

		case NotificationType.PostAdd:
			return getRouteLocationForModel(action_model as FiresidePostModel);

		case NotificationType.SellableSell:
			return {
				name: 'home',
			};

		case NotificationType.Mention: {
			const mention = action_model as MentionModel;
			switch (mention.resource) {
				case 'Comment':
				case 'Forum_Post':
					// Pull through the "go" func below since we can't statically get it.
					return '';

				case 'Game':
					return getRouteLocationForModel(to_model as GameModel);

				case 'User':
					return getRouteLocationForModel(to_model as UserModel);

				case 'Fireside_Post':
					return getRouteLocationForModel(to_model as FiresidePostModel);

				default:
					return assertNever(mention.resource);
			}
		}

		case NotificationType.FiresideStart:
			return getRouteLocationForModel(action_model as FiresideModel);

		case NotificationType.FiresideStreamNotification:
			return getRouteLocationForModel(
				(action_model as FiresideStreamNotificationModel).fireside
			);

		case NotificationType.FiresideFeaturedInCommunity:
			return getRouteLocationForModel(to_model as FiresideModel);

		case NotificationType.QuestNotification:
			// Handled in the [go] function.
			return '';

		case NotificationType.ChargedSticker: {
			return routeDashSupporters;
		}

		case NotificationType.SupporterMessage: {
			// Messages might have their height cropped in the notification
			// feed. Don't return a location here, we'll instead show a
			// modal in the `go` function.
			return '';
		}

		case NotificationType.PollEnded: {
			if (from_model) {
				return getRouteLocationForModel(from_model);
			}
			break;
		}

		case NotificationType.CreatorLevelUp:
			// Don't return a location here, we'll instead show a modal in the
			// `go` function.
			return '';

		case NotificationType.UnlockedAvatarFrame: {
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
	notification: NotificationModel,
	{ router, appStore }: { router: Router; appStore: AppStore }
) {
	const { id, type, action_model } = notification;

	const routeLocation = getNotificationRouteLocation(notification);
	if (routeLocation !== '') {
		router.push(routeLocation);
		return;
	}

	if (
		type === NotificationType.GameTrophyAchieved ||
		type === NotificationType.SiteTrophyAchieved
	) {
		if (action_model instanceof UserBaseTrophyModel) {
			TrophyModal.show(action_model);
		}
	} else if (
		type === NotificationType.CommentAdd ||
		type === NotificationType.CommentAddObjectOwner ||
		type === NotificationType.Mention ||
		type === NotificationType.ForumPostAdd
	) {
		// Need to fetch the URL first.
		let url: string;
		let model = action_model;

		if (action_model instanceof MentionModel) {
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
			if (model instanceof CommentModel) {
				url = await getCommentUrl(model.id);
			} else if (model instanceof ForumPostModel) {
				url = await getForumPostUrl(model.id);
			} else if (model instanceof FiresidePostModel) {
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
	} else if (type === NotificationType.SupporterMessage) {
		if (action_model instanceof SupporterActionModel) {
			SupporterMessageModal.show(action_model);
		}
	} else if (type === NotificationType.CreatorLevelUp) {
		if (action_model instanceof CreatorExperienceLevelModel) {
			CreatorExperienceLevelUpModal.show(action_model);
		}
	} else if (type === NotificationType.QuestNotification) {
		if (action_model instanceof QuestNotificationModel) {
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
