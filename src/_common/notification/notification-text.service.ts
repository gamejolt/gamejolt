import { CommunityModel } from '../community/community.model';
import {
	CommunityUserNotificationModel,
	CommunityUserNotificationType,
} from '../community/user-notification/user-notification.model';
import { CreatorExperienceLevelModel } from '../creator/experience/level.model';
import { formatCurrency } from '../filters/currency';
import { FiresideCommunityModel } from '../fireside/community/community.model';
import { FiresideModel } from '../fireside/fireside.model';
import { FiresidePostCommunityModel } from '../fireside/post/community/community.model';
import { FiresidePostModel } from '../fireside/post/post-model';
import { FiresideStreamNotificationModel } from '../fireside/stream-notification/stream-notification.model';
import { ForumTopicModel } from '../forum/topic/topic.model';
import { GameModel } from '../game/game.model';
import { GameTrophyModel } from '../game/trophy/trophy.model';
import { MentionModel } from '../mention/mention.model';
import type { OrderItemModel } from '../order/item/item.model';
import { QuestNotificationModel } from '../quest/quest-notification-model';
import { SellableModel } from '../sellable/sellable.model';
import { SiteTrophyModel } from '../site/trophy/trophy.model';
import { SupporterActionModel } from '../supporters/action.model';
import { $gettext } from '../translate/translate.service';
import { UserGameTrophy } from '../user/trophy/game-trophy.model';
import { UserSiteTrophyModel } from '../user/trophy/site-trophy.model';
import { UserModel } from '../user/user.model';
import { NotificationModel, NotificationType } from './notification-model';

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
			case NotificationType.PostAdd: {
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

			case NotificationType.PostFeaturedInCommunity: {
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

			case NotificationType.FiresideFeaturedInCommunity: {
				return _process(
					$gettext(
						`Your Fireside in the <em>%{ community }</em> community has been featured!`,
						{
							community: (notification.action_model as FiresideCommunityModel)
								.community.name,
						},
						{ enableHTMLEscaping: !plaintext }
					)
				);
			}

			case NotificationType.CommunityUserNotification:
				{
					const userNotification =
						notification.action_model as CommunityUserNotificationModel;

					switch (userNotification.type) {
						case CommunityUserNotificationType.POSTS_MOVE:
							return _process(
								$gettext(
									`Your post in the <em>%{ community }</em> community has been <b>moved</b> to a different channel.`,
									{
										community: userNotification.community.name,
									},
									{ enableHTMLEscaping: !plaintext }
								)
							);
						case CommunityUserNotificationType.POSTS_EJECT:
							return _process(
								$gettext(
									`Your post has been <b>ejected</b> from the <em>%{ community }</em> community.`,
									{
										community: userNotification.community.name,
									},
									{ enableHTMLEscaping: !plaintext }
								)
							);
						case CommunityUserNotificationType.FIRESIDES_EJECT:
							return _process(
								$gettext(
									`Your Fireside has been <b>ejected</b> from the <em>%{ community }</em> community.`,
									{
										community: userNotification.community.name,
									},
									{ enableHTMLEscaping: !plaintext }
								)
							);
					}
				}
				break;

			case NotificationType.GameTrophyAchieved: {
				if (
					notification.action_model instanceof UserGameTrophy &&
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

			case NotificationType.SiteTrophyAchieved: {
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

			case NotificationType.CommentAddObjectOwner: {
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

			case NotificationType.CommentAdd: {
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

			case NotificationType.ForumPostAdd: {
				return _process(
					$gettext(
						`<em>%{ subject }</em> posted a new forum post to <b>%{ object }</b>.`,
						this.getTranslationValues(notification),
						{ enableHTMLEscaping: !plaintext }
					)
				);
			}

			case NotificationType.FriendshipRequest: {
				return _process(
					$gettext(
						`<em>%{ subject }</em> sent you a friend request.`,
						this.getTranslationValues(notification),
						{ enableHTMLEscaping: !plaintext }
					)
				);
			}

			case NotificationType.FriendshipAccept: {
				return _process(
					$gettext(
						`<em>%{ subject }</em> accepted your friend request.`,
						this.getTranslationValues(notification),
						{ enableHTMLEscaping: !plaintext }
					)
				);
			}

			case NotificationType.GameRatingAdd: {
				return _process(
					$gettext(
						`<em>%{ subject }</em> liked <b>%{ object }</b>.`,
						this.getTranslationValues(notification),
						{ enableHTMLEscaping: !plaintext }
					)
				);
			}

			case NotificationType.GameFollow: {
				return _process(
					$gettext(
						`<em>%{ subject }</em> followed <b>%{ object }</b>.`,
						this.getTranslationValues(notification),
						{ enableHTMLEscaping: !plaintext }
					)
				);
			}

			case NotificationType.SellableSell: {
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

			case NotificationType.UserFollow: {
				return _process(
					$gettext(
						`<em>%{ subject }</em> followed you.`,
						this.getTranslationValues(notification),
						{ enableHTMLEscaping: !plaintext }
					)
				);
			}

			case NotificationType.CollaboratorInvite: {
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

			case NotificationType.Mention: {
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

			case NotificationType.QuestNotification: {
				if (notification.action_model instanceof QuestNotificationModel) {
					// TODO(quests) translation support for notifications
					return _process($gettext(notification.action_model.title));
				}

				break;
			}

			case NotificationType.FiresideStart: {
				if (notification.action_model instanceof FiresideModel) {
					return _process(
						$gettext(
							`<em>%{ subject }</em> is live!`,
							this.getTranslationValues(notification),
							{ enableHTMLEscaping: !plaintext }
						)
					);
				}

				break;
			}

			case NotificationType.FiresideStreamNotification: {
				const users = (notification.action_model as FiresideStreamNotificationModel).users;

				if (users.length === 0) {
					return undefined;
				}

				const userInterpolates: { [name: string]: string } = {};
				let i = 1;
				for (const user of users) {
					userInterpolates[`user${i}`] = `@${user.username}`;
					i++;
				}

				switch (users.length) {
					case 1:
						return _process(
							$gettext(`<em>%{ user1 }</em> is live!`, userInterpolates, {
								enableHTMLEscaping: !plaintext,
							})
						);

					case 2:
						return _process(
							$gettext(
								`<em>%{ user1 }</em> and <em>%{ user2 }</em> are live!`,
								userInterpolates,
								{ enableHTMLEscaping: !plaintext }
							)
						);

					default:
						return _process(
							$gettext(
								`<em>%{ user1 }</em>, <em>%{ user2 }</em> and <em>%{ more }</em> more are live!`,
								{
									...userInterpolates,
									more: users.length - 2,
								},
								{ enableHTMLEscaping: !plaintext }
							)
						);
				}
			}

			case NotificationType.ChargedSticker: {
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

			case NotificationType.SupporterMessage: {
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

			case NotificationType.PollEnded: {
				return _process($gettext(`Poll's closed, results are in!`));
			}

			case NotificationType.CreatorLevelUp: {
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

			case NotificationType.UnlockedAvatarFrame: {
				return _process($gettext(`You unlocked a new <em>avatar frame</em>!`));
			}
		}

		// When the notification type has no implementation, we log and don't show it (return undefined).
		console.warn('Encountered not-implemented notification type', notification.type);
		return undefined;
	}
}
