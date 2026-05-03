import { CommunityModel } from '~common/community/community.model';
import {
	CommunityUserNotificationModel,
	CommunityUserNotificationTypePOSTS_EJECT,
	CommunityUserNotificationTypePOSTS_MOVE,
} from '~common/community/user-notification/user-notification.model';
import { CreatorExperienceLevelModel } from '~common/creator/experience/level.model';
import { formatCurrency } from '~common/filters/currency';
import { FiresidePostCommunityModel } from '~common/fireside/post/community/community.model';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import { ForumTopicModel } from '~common/forum/topic/topic.model';
import { GameModel } from '~common/game/game.model';
import { GameTrophyModel } from '~common/game/trophy/trophy.model';
import { MentionModel } from '~common/mention/mention.model';
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
import type { OrderItemModel } from '~common/order/item/item.model';
import { QuestNotificationModel } from '~common/quest/quest-notification-model';
import { SellableModel } from '~common/sellable/sellable.model';
import { SiteTrophyModel } from '~common/site/trophy/trophy.model';
import { SupporterActionModel } from '~common/supporters/action.model';
import { $gettext } from '~common/translate/translate.service';
import { UserGameTrophyModel } from '~common/user/trophy/game-trophy.model';
import { UserSiteTrophyModel } from '~common/user/trophy/site-trophy.model';
import { UserModel } from '~common/user/user.model';

export class NotificationText {
	private static getSubjectTranslationValue(notification: NotificationModel) {
		if (notification.is_user_based) {
			if (notification.from_model instanceof UserModel) {
				return (
					notification.from_model.display_name +
					' (@' +
					notification.from_model.username +
					')'
				);
			} else {
				return $gettext('Someone');
			}
		} else if (notification.is_game_based && notification.to_model instanceof GameModel) {
			return notification.to_model.title;
		} else if (
			notification.is_community_based &&
			notification.from_model instanceof CommunityModel
		) {
			return notification.from_model.name;
		}
		return '';
	}

	private static getTranslationValues(notification: NotificationModel) {
		const subject = this.getSubjectTranslationValue(notification);
		const output = { subject } as any;

		if (
			notification.to_model instanceof GameModel ||
			notification.to_model instanceof ForumTopicModel
		) {
			output.object = notification.to_model.title;
		} else if (notification.to_model instanceof CommunityModel) {
			output.object = notification.to_model.name;
		} else if (notification.to_model instanceof FiresidePostModel) {
			output.object = notification.to_model.getShortLead();
		} else if (notification.to_model instanceof UserModel) {
			if (
				notification.from_model instanceof UserModel &&
				notification.from_model.id === notification.to_model.id
			) {
				output.object = $gettext('them');
			} else {
				output.object =
					notification.to_model.display_name +
					' (@' +
					notification.to_model.username +
					')';
			}
		}

		return output;
	}

	/**
	 * Gets notification display text.
	 *
	 * @param plaintext When `true` returns the text without any modifications done to accomodate for HTML rendering.
	 */
	public static getText(notification: NotificationModel, plaintext: boolean): string | undefined {
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
			case NotificationTypePostAdd: {
				let gameTitle = '';
				let postTitle = '';
				if (notification.to_model instanceof GameModel) {
					gameTitle = notification.to_model.title + ' - ';
				}
				if (notification.action_model instanceof FiresidePostModel) {
					postTitle = notification.action_model.getShortLead();
				}
				return gameTitle + postTitle;
			}

			case NotificationTypePostFeaturedInCommunity: {
				const postCommunity = notification.action_model as FiresidePostCommunityModel;

				return _process(
					$gettext(
						`Your post in the <em>%{ community }</em> community has been featured!`,
						{
							community: postCommunity.community.name,
						},
						{ enableHTMLEscaping: !plaintext }
					)
				);
			}

			case NotificationTypeCommunityUserNotification:
				{
					const userNotification =
						notification.action_model as CommunityUserNotificationModel;

					switch (userNotification.type) {
						case CommunityUserNotificationTypePOSTS_MOVE:
							return _process(
								$gettext(
									`Your post in the <em>%{ community }</em> community has been <b>moved</b> to a different channel.`,
									{
										community: userNotification.community.name,
									},
									{ enableHTMLEscaping: !plaintext }
								)
							);
						case CommunityUserNotificationTypePOSTS_EJECT:
							return _process(
								$gettext(
									`Your post has been <b>ejected</b> from the <em>%{ community }</em> community.`,
									{
										community: userNotification.community.name,
									},
									{ enableHTMLEscaping: !plaintext }
								)
							);
					}
				}
				break;

			case NotificationTypeGameTrophyAchieved: {
				if (
					notification.action_model instanceof UserGameTrophyModel &&
					notification.action_model.trophy instanceof GameTrophyModel &&
					notification.action_model.game instanceof GameModel
				) {
					return _process(
						$gettext(
							`You achieved <em>%{ trophyTitle }</em> on <b>%{ gameTitle }</b>!`,
							{
								trophyTitle: notification.action_model.trophy.title,
								gameTitle: notification.action_model.game.title,
							},
							{ enableHTMLEscaping: !plaintext }
						)
					);
				}
				break;
			}

			case NotificationTypeSiteTrophyAchieved: {
				if (
					notification.action_model instanceof UserSiteTrophyModel &&
					notification.action_model.trophy instanceof SiteTrophyModel
				) {
					return _process(
						$gettext(
							`You achieved the Game Jolt Trophy <em>%{ trophyTitle }</em>!`,
							{
								trophyTitle: notification.action_model.trophy.title,
							},
							{ enableHTMLEscaping: !plaintext }
						)
					);
				}
				break;
			}

			case NotificationTypeCommentAddObjectOwner: {
				if (notification.to_model instanceof UserModel) {
					return _process(
						$gettext(
							`<em>%{ subject }</em> shouted at you!`,
							this.getTranslationValues(notification),
							{ enableHTMLEscaping: !plaintext }
						)
					);
				} else {
					return _process(
						$gettext(
							`<em>%{ subject }</em> commented on <b>%{ object }</b>.`,
							this.getTranslationValues(notification),
							{ enableHTMLEscaping: !plaintext }
						)
					);
				}
			}

			case NotificationTypeCommentAdd: {
				if (notification.to_model instanceof UserModel) {
					return _process(
						$gettext(
							`<em>%{ subject }</em> replied to your shout to <b>%{ object }</b>.`,
							this.getTranslationValues(notification),
							{ enableHTMLEscaping: !plaintext }
						)
					);
				} else {
					return _process(
						$gettext(
							`<em>%{ subject }</em> replied to your comment on <b>%{ object }</b>.`,
							this.getTranslationValues(notification),
							{ enableHTMLEscaping: !plaintext }
						)
					);
				}
			}

			case NotificationTypeForumPostAdd: {
				return _process(
					$gettext(
						`<em>%{ subject }</em> posted a new forum post to <b>%{ object }</b>.`,
						this.getTranslationValues(notification),
						{ enableHTMLEscaping: !plaintext }
					)
				);
			}

			case NotificationTypeFriendshipRequest: {
				return _process(
					$gettext(
						`<em>%{ subject }</em> sent you a friend request.`,
						this.getTranslationValues(notification),
						{ enableHTMLEscaping: !plaintext }
					)
				);
			}

			case NotificationTypeFriendshipAccept: {
				return _process(
					$gettext(
						`<em>%{ subject }</em> accepted your friend request.`,
						this.getTranslationValues(notification),
						{ enableHTMLEscaping: !plaintext }
					)
				);
			}

			case NotificationTypeGameRatingAdd: {
				return _process(
					$gettext(
						`<em>%{ subject }</em> liked <b>%{ object }</b>.`,
						this.getTranslationValues(notification),
						{ enableHTMLEscaping: !plaintext }
					)
				);
			}

			case NotificationTypeGameFollow: {
				return _process(
					$gettext(
						`<em>%{ subject }</em> followed <b>%{ object }</b>.`,
						this.getTranslationValues(notification),
						{ enableHTMLEscaping: !plaintext }
					)
				);
			}

			case NotificationTypeSellableSell: {
				const sellable = notification.to_model as SellableModel;
				const orderItem = notification.action_model as OrderItemModel;
				const translationValues = {
					object: sellable.title,
					amount: formatCurrency(orderItem.amount),
					subject: this.getSubjectTranslationValue(notification),
				};

				return _process(
					$gettext(
						`<em>%{ subject }</em> bought a package in <b>%{ object }</b> for %{ amount }.`,
						translationValues,
						{ enableHTMLEscaping: !plaintext }
					)
				);
			}

			case NotificationTypeUserFollow: {
				return _process(
					$gettext(
						`<em>%{ subject }</em> followed you.`,
						this.getTranslationValues(notification),
						{ enableHTMLEscaping: !plaintext }
					)
				);
			}

			case NotificationTypeCollaboratorInvite: {
				switch (notification.to_resource) {
					case 'Game':
						return _process(
							$gettext(
								`<em>%{ subject }</em> invited you to collaborate on the game <b>%{ object }</b>.`,
								this.getTranslationValues(notification),
								{ enableHTMLEscaping: !plaintext }
							)
						);
					case 'Community':
						return _process(
							$gettext(
								`<em>%{ subject }</em> invited you to collaborate on the <b>%{ object }</b> community.`,
								this.getTranslationValues(notification),
								{ enableHTMLEscaping: !plaintext }
							)
						);
				}
				break;
			}

			case NotificationTypeMention: {
				const mention = notification.action_model as MentionModel;

				switch (mention.resource) {
					case 'Comment': {
						if (notification.to_model instanceof GameModel) {
							return _process(
								$gettext(
									`<em>%{ subject }</em> mentioned you in a comment on the game <b>%{ object }</b>.`,
									{
										object: notification.to_model.title,
										subject: this.getSubjectTranslationValue(notification),
									},
									{ enableHTMLEscaping: !plaintext }
								)
							);
						} else if (notification.to_model instanceof FiresidePostModel) {
							return _process(
								$gettext(
									`<em>%{ subject }</em> mentioned you in a comment on the post <b>%{ object }</b>.`,
									{
										object: notification.to_model.getShortLead(),
										subject: this.getSubjectTranslationValue(notification),
									},
									{ enableHTMLEscaping: !plaintext }
								)
							);
						} else if (notification.to_model instanceof UserModel) {
							return _process(
								$gettext(
									`<em>%{ subject }</em> mentioned you in a shout to @<b>%{ object }</b>.`,
									{
										object: notification.to_model.username,
										subject: this.getSubjectTranslationValue(notification),
									},
									{ enableHTMLEscaping: !plaintext }
								)
							);
						}
						break;
					}

					case 'Game': {
						return _process(
							$gettext(
								`<em>%{ subject }</em> mentioned you in the game <b>%{ object }</b>.`,
								{
									object: (notification.to_model as GameModel).title,
									subject: this.getSubjectTranslationValue(notification),
								},
								{ enableHTMLEscaping: !plaintext }
							)
						);
					}

					case 'User': {
						return _process(
							$gettext(
								`<em>%{ subject }</em> mentioned you in their user bio.`,
								this.getTranslationValues(notification),
								{ enableHTMLEscaping: !plaintext }
							)
						);
					}

					case 'Fireside_Post': {
						return _process(
							$gettext(
								`<em>%{ subject }</em> mentioned you in the post <b>%{ object }</b>.`,
								{
									object: (
										notification.to_model as FiresidePostModel
									).getShortLead(),
									subject: this.getSubjectTranslationValue(notification),
								},
								{ enableHTMLEscaping: !plaintext }
							)
						);
					}

					case 'Forum_Post': {
						return _process(
							$gettext(
								`<em>%{ subject }</em> mentioned you in a forum post to <b>%{ object }</b>.`,
								{
									object: (notification.to_model as ForumTopicModel).title,
									subject: this.getSubjectTranslationValue(notification),
								},
								{ enableHTMLEscaping: !plaintext }
							)
						);
					}

					default: {
						console.warn(
							'Encountered not-implemented resource type for mention notification',
							mention.resource
						);
						return undefined;
					}
				}

				break;
			}

			case NotificationTypeQuestNotification: {
				if (notification.action_model instanceof QuestNotificationModel) {
					// TODO(quests) translation support for notifications
					return _process($gettext(notification.action_model.title));
				}

				break;
			}

			case NotificationTypeChargedSticker: {
				if (notification.to_resource === 'Fireside_Post') {
					return _process(
						$gettext(
							`<em>%{ subject }</em> placed a charged sticker on your post <b>%{ object }</b>.`,
							this.getTranslationValues(notification),
							{ enableHTMLEscaping: !plaintext }
						)
					);
				} else if (notification.to_resource === 'Fireside') {
					return _process(
						$gettext(
							`<em>%{ subject }</em> placed a charged sticker on your fireside stream.`,
							this.getTranslationValues(notification),
							{ enableHTMLEscaping: !plaintext }
						)
					);
				}
				break;
			}

			case NotificationTypeSupporterMessage: {
				const action =
					notification.action_model instanceof SupporterActionModel
						? notification.action_model
						: null;

				if (action?.isChargedSticker) {
					return _process(
						$gettext(
							`<em>%{ subject }</em> thanked you for giving them a charged sticker.`,
							this.getTranslationValues(notification),
							{ enableHTMLEscaping: !plaintext }
						)
					);
				}

				return _process(
					$gettext(
						`<em>%{ subject }</em> thanked you for supporting them.`,
						this.getTranslationValues(notification),
						{ enableHTMLEscaping: !plaintext }
					)
				);
			}

			case NotificationTypePollEnded: {
				return _process($gettext(`Poll's closed, results are in!`));
			}

			case NotificationTypeCreatorLevelUp: {
				if (notification.action_model instanceof CreatorExperienceLevelModel) {
					return _process(
						$gettext(
							`You've reached <b>Creator Level %{ level }</b>!`,
							{ level: notification.action_model.level },
							{ enableHTMLEscaping: !plaintext }
						)
					);
				}
				break;
			}

			case NotificationTypeUnlockedAvatarFrame: {
				return _process($gettext(`You unlocked a new <em>avatar frame</em>!`));
			}

			case NotificationTypeShopGiftReceived: {
				return _process(
					$gettext(
						`<em>%{ subject }</em> sent you a gift!`,
						this.getTranslationValues(notification),
						{ enableHTMLEscaping: !plaintext }
					)
				);
			}
		}

		// When the notification type has no implementation, we log and don't show it (return undefined).
		console.warn('Encountered not-implemented notification type', notification.type);
		return undefined;
	}
}
