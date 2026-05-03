import { showGiftActionModal } from '~app/components/gift/modal.service';
import { AppStore } from '~app/store/index';
import { routeDashAccountEdit } from '~app/views/dashboard/account/edit/edit.route';
import { routeDashSupporters } from '~app/views/dashboard/supporters/supporters.route';
import { CommentModel, getCommentUrl } from '~common/comment/comment-model';
import { CommunityModel } from '~common/community/community.model';
import {
	CommunityUserNotificationModel,
	CommunityUserNotificationTypePOSTS_EJECT,
	CommunityUserNotificationTypePOSTS_MOVE,
} from '~common/community/user-notification/user-notification.model';
import { CreatorExperienceLevelModel } from '~common/creator/experience/level.model';
import { showCreatorExperienceLevelUpModal } from '~common/creator/experience/level-up-modal/modal.service';
import { Environment } from '~common/environment/environment.service';
import { FiresidePostCommunityModel } from '~common/fireside/post/community/community.model';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import { ForumPostModel, getForumPostUrl } from '~common/forum/post/post.model';
import { GameModel } from '~common/game/game.model';
import { showErrorGrowl } from '~common/growls/growls.service';
import { InventoryShopGiftModel } from '~common/inventory/shop/inventory-shop-gift.model';
import { MentionModel } from '~common/mention/mention.model';
import { Navigate } from '~common/navigate/navigate.service';
import {
	NotificationModel,
	NotificationTypeChargedSticker,
	NotificationTypeCollaboratorInvite,
	NotificationTypeCommentAdd,
	NotificationTypeCommentAddObjectOwner,
	NotificationTypeCommunityUserNotification,
	NotificationTypeCreatorLevelUp,
	NotificationTypeForumPostAdd,
	NotificationTypeFriendshipAccept,
	NotificationTypeFriendshipRequest,
	NotificationTypeGameFollow,
	NotificationTypeGameRatingAdd,
	NotificationTypeGameTrophyAchieved,
	NotificationTypeMention,
	NotificationTypePollEnded,
	NotificationTypePostAdd,
	NotificationTypePostFeaturedInCommunity,
	NotificationTypeQuestNotification,
	NotificationTypeSellableSell,
	NotificationTypeShopGiftReceived,
	NotificationTypeSiteTrophyAchieved,
	NotificationTypeSupporterMessage,
	NotificationTypeUnlockedAvatarFrame,
	NotificationTypeUserFollow,
} from '~common/notification/notification-model';
import { QuestNotificationModel } from '~common/quest/quest-notification-model';
import { getCurrentRouter } from '~common/route/current-router-service';
import { SupporterActionModel } from '~common/supporters/action.model';
import { showSupporterMessageModal } from '~common/supporters/message/modal.service';
import { $gettext } from '~common/translate/translate.service';
import { showTrophyModal } from '~common/trophy/modal/modal.service';
import { UserBaseTrophyModel } from '~common/user/trophy/user-base-trophy.model';
import { UserModel } from '~common/user/user.model';
import { isKnownRoute, RouteLocationDefinition } from '~utils/router';
import { assertNever } from '~utils/utils';

function getRouteLocationForModel(
	model:
		| GameModel
		| UserModel
		| FiresidePostModel
		| CommunityModel
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
	}
	return '';
}

export function getNotificationRouteLocation(
	notification: NotificationModel
): RouteLocationDefinition | '' {
	const { type, action_model, from_model, to_model, to_resource, action_resource_id } =
		notification;

	switch (type) {
		case NotificationTypeFriendshipRequest:
		case NotificationTypeFriendshipAccept:
			return getRouteLocationForModel(from_model);

		case NotificationTypeUserFollow:
			return getRouteLocationForModel(from_model);

		case NotificationTypeGameRatingAdd:
			return getRouteLocationForModel(from_model);

		case NotificationTypeGameFollow:
			return getRouteLocationForModel(from_model);

		case NotificationTypePostFeaturedInCommunity:
			return getRouteLocationForModel((action_model as FiresidePostCommunityModel).community);

		case NotificationTypeCommunityUserNotification:
			switch ((action_model as CommunityUserNotificationModel).type) {
				case CommunityUserNotificationTypePOSTS_MOVE:
				case CommunityUserNotificationTypePOSTS_EJECT:
					return getRouteLocationForModel(to_model as FiresidePostModel);
			}
			break;

		case NotificationTypeCollaboratorInvite:
			switch (to_resource) {
				case 'Game':
					return getRouteLocationForModel(to_model as GameModel);
				case 'Community':
					return getRouteLocationForModel(to_model as CommunityModel);
			}
			break;

		case NotificationTypePostAdd:
			return getRouteLocationForModel(action_model as FiresidePostModel);

		case NotificationTypeSellableSell:
			return {
				name: 'home',
			};

		case NotificationTypeMention: {
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

		case NotificationTypeQuestNotification:
			// Handled in the [go] function.
			return '';

		case NotificationTypeChargedSticker: {
			return routeDashSupporters;
		}

		case NotificationTypeSupporterMessage: {
			// Messages might have their height cropped in the notification
			// feed. Don't return a location here, we'll instead show a
			// modal in the `go` function.
			return '';
		}

		case NotificationTypePollEnded: {
			if (from_model) {
				return getRouteLocationForModel(from_model);
			}
			break;
		}

		case NotificationTypeCreatorLevelUp:
			// Don't return a location here, we'll instead show a modal in the
			// `go` function.
			return '';

		case NotificationTypeUnlockedAvatarFrame: {
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
	{ appStore }: { appStore: AppStore }
) {
	const { id, type, action_model } = notification;
	const router = getCurrentRouter();

	const routeLocation = getNotificationRouteLocation(notification);
	if (routeLocation !== '') {
		router.push(routeLocation);
		return;
	}

	if (
		type === NotificationTypeGameTrophyAchieved ||
		type === NotificationTypeSiteTrophyAchieved
	) {
		if (action_model instanceof UserBaseTrophyModel) {
			showTrophyModal(action_model);
		}
	} else if (
		type === NotificationTypeCommentAdd ||
		type === NotificationTypeCommentAddObjectOwner ||
		type === NotificationTypeMention ||
		type === NotificationTypeForumPostAdd
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
	} else if (type === NotificationTypeSupporterMessage) {
		if (action_model instanceof SupporterActionModel) {
			showSupporterMessageModal(action_model);
		}
	} else if (type === NotificationTypeCreatorLevelUp) {
		if (action_model instanceof CreatorExperienceLevelModel) {
			showCreatorExperienceLevelUpModal(action_model);
		}
	} else if (type === NotificationTypeQuestNotification) {
		if (action_model instanceof QuestNotificationModel) {
			const { quest_id } = action_model;

			const { toggleLeftPane, visibleLeftPane, getQuestStore } = appStore;
			const { activeQuest } = getQuestStore();

			if (visibleLeftPane.value !== 'quests') {
				toggleLeftPane('quests');
			}

			activeQuest.value = quest_id;
		}
	} else if (type === NotificationTypeShopGiftReceived) {
		if (action_model instanceof InventoryShopGiftModel && action_model.product) {
			showGiftActionModal({
				gift: action_model,
				product: action_model.product,
				stickerPacks: undefined,
			});
		}
	}
}
