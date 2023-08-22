import { Community } from '../community/community.model';
import {
	CommunityUserNotification,
	CommunityUserNotificationType,
} from '../community/user-notification/user-notification.model';
import { CreatorExperienceLevel } from '../creator/experience/level.model';
import { formatCurrency } from '../filters/currency';
import { FiresideCommunity } from '../fireside/community/community.model';
import { Fireside } from '../fireside/fireside.model';
import { FiresidePostCommunity } from '../fireside/post/community/community.model';
import { FiresidePost } from '../fireside/post/post-model';
import { FiresideStreamNotification } from '../fireside/stream-notification/stream-notification.model';
import { ForumTopic } from '../forum/topic/topic.model';
import { Game } from '../game/game.model';
import { GameTrophy } from '../game/trophy/trophy.model';
import { Mention } from '../mention/mention.model';
import type { OrderItem } from '../order/item/item.model';
import { QuestNotification } from '../quest/quest-notification-model';
import { Sellable } from '../sellable/sellable.model';
import { SiteTrophy } from '../site/trophy/trophy.model';
import { SupporterAction } from '../supporters/action.model';
import { $gettext, $gettextInterpolate } from '../translate/translate.service';
import { UserGameTrophy } from '../user/trophy/game-trophy.model';
import { UserSiteTrophy } from '../user/trophy/site-trophy.model';
import { User } from '../user/user.model';
import { Notification, NotificationType } from './notification-model';

export class NotificationText {
	private static getSubjectTranslationValue(notification: Notification) {
		if (notification.is_user_based) {
			if (notification.from_model instanceof User) {
				return (
					notification.from_model.display_name +
					' (@' +
					notification.from_model.username +
					')'
				);
			} else {
				return $gettext('Someone');
			}
		} else if (notification.is_game_based && notification.to_model instanceof Game) {
			return notification.to_model.title;
		} else if (
			notification.is_community_based &&
			notification.from_model instanceof Community
		) {
			return notification.from_model.name;
		}
		return '';
	}

	private static getTranslationValues(notification: Notification) {
		const subject = this.getSubjectTranslationValue(notification);
		const output = { subject } as any;

		if (notification.to_model instanceof Game || notification.to_model instanceof ForumTopic) {
			output.object = notification.to_model.title;
		} else if (notification.to_model instanceof Community) {
			output.object = notification.to_model.name;
		} else if (notification.to_model instanceof FiresidePost) {
			output.object = notification.to_model.getShortLead();
		} else if (notification.to_model instanceof User) {
			if (
				notification.from_model instanceof User &&
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
	public static getText(notification: Notification, plaintext: boolean): string | undefined {
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
				if (notification.to_model instanceof Game) {
					gameTitle = notification.to_model.title + ' - ';
				}
				if (notification.action_model instanceof FiresidePost) {
					postTitle = notification.action_model.getShortLead();
				}
				return gameTitle + postTitle;
			}

			case NotificationType.PostFeaturedInCommunity: {
				const postCommunity = notification.action_model as FiresidePostCommunity;

				return _process(
					$gettextInterpolate(
						`Your post in the <em>%{ community }</em> community has been featured!`,
						{
							community: postCommunity.community.name,
						},
						!plaintext
					)
				);
			}

			case NotificationType.FiresideFeaturedInCommunity: {
				return _process(
					$gettextInterpolate(
						`Your Fireside in the <em>%{ community }</em> community has been featured!`,
						{
							community: (notification.action_model as FiresideCommunity).community
								.name,
						},
						!plaintext
					)
				);
			}

			case NotificationType.CommunityUserNotification:
				{
					const userNotification = notification.action_model as CommunityUserNotification;

					switch (userNotification.type) {
						case CommunityUserNotificationType.POSTS_MOVE:
							return _process(
								$gettextInterpolate(
									`Your post in the <em>%{ community }</em> community has been <b>moved</b> to a different channel.`,
									{
										community: userNotification.community.name,
									},
									!plaintext
								)
							);
						case CommunityUserNotificationType.POSTS_EJECT:
							return _process(
								$gettextInterpolate(
									`Your post has been <b>ejected</b> from the <em>%{ community }</em> community.`,
									{
										community: userNotification.community.name,
									},
									!plaintext
								)
							);
						case CommunityUserNotificationType.FIRESIDES_EJECT:
							return _process(
								$gettextInterpolate(
									`Your Fireside has been <b>ejected</b> from the <em>%{ community }</em> community.`,
									{
										community: userNotification.community.name,
									},
									!plaintext
								)
							);
					}
				}
				break;

			case NotificationType.GameTrophyAchieved: {
				if (
					notification.action_model instanceof UserGameTrophy &&
					notification.action_model.trophy instanceof GameTrophy &&
					notification.action_model.game instanceof Game
				) {
					return _process(
						$gettextInterpolate(
							`You achieved <em>%{ trophyTitle }</em> on <b>%{ gameTitle }</b>!`,
							{
								trophyTitle: notification.action_model.trophy.title,
								gameTitle: notification.action_model.game.title,
							},
							!plaintext
						)
					);
				}
				break;
			}

			case NotificationType.SiteTrophyAchieved: {
				if (
					notification.action_model instanceof UserSiteTrophy &&
					notification.action_model.trophy instanceof SiteTrophy
				) {
					return _process(
						$gettextInterpolate(
							`You achieved the Game Jolt Trophy <em>%{ trophyTitle }</em>!`,
							{
								trophyTitle: notification.action_model.trophy.title,
							},
							!plaintext
						)
					);
				}
				break;
			}

			case NotificationType.CommentAddObjectOwner: {
				if (notification.to_model instanceof User) {
					return _process(
						$gettextInterpolate(
							`<em>%{ subject }</em> shouted at you!`,
							this.getTranslationValues(notification),
							!plaintext
						)
					);
				} else {
					return _process(
						$gettextInterpolate(
							`<em>%{ subject }</em> commented on <b>%{ object }</b>.`,
							this.getTranslationValues(notification),
							!plaintext
						)
					);
				}
			}

			case NotificationType.CommentAdd: {
				if (notification.to_model instanceof User) {
					return _process(
						$gettextInterpolate(
							`<em>%{ subject }</em> replied to your shout to <b>%{ object }</b>.`,
							this.getTranslationValues(notification),
							!plaintext
						)
					);
				} else {
					return _process(
						$gettextInterpolate(
							`<em>%{ subject }</em> replied to your comment on <b>%{ object }</b>.`,
							this.getTranslationValues(notification),
							!plaintext
						)
					);
				}
			}

			case NotificationType.ForumPostAdd: {
				return _process(
					$gettextInterpolate(
						`<em>%{ subject }</em> posted a new forum post to <b>%{ object }</b>.`,
						this.getTranslationValues(notification),
						!plaintext
					)
				);
			}

			case NotificationType.FriendshipRequest: {
				return _process(
					$gettextInterpolate(
						`<em>%{ subject }</em> sent you a friend request.`,
						this.getTranslationValues(notification),
						!plaintext
					)
				);
			}

			case NotificationType.FriendshipAccept: {
				return _process(
					$gettextInterpolate(
						`<em>%{ subject }</em> accepted your friend request.`,
						this.getTranslationValues(notification),
						!plaintext
					)
				);
			}

			case NotificationType.GameRatingAdd: {
				return _process(
					$gettextInterpolate(
						`<em>%{ subject }</em> liked <b>%{ object }</b>.`,
						this.getTranslationValues(notification),
						!plaintext
					)
				);
			}

			case NotificationType.GameFollow: {
				return _process(
					$gettextInterpolate(
						`<em>%{ subject }</em> followed <b>%{ object }</b>.`,
						this.getTranslationValues(notification),
						!plaintext
					)
				);
			}

			case NotificationType.SellableSell: {
				const sellable = notification.to_model as Sellable;
				const orderItem = notification.action_model as OrderItem;
				const translationValues = {
					object: sellable.title,
					amount: formatCurrency(orderItem.amount),
					subject: this.getSubjectTranslationValue(notification),
				};

				return _process(
					$gettextInterpolate(
						`<em>%{ subject }</em> bought a package in <b>%{ object }</b> for %{ amount }.`,
						translationValues,
						!plaintext
					)
				);
			}

			case NotificationType.UserFollow: {
				return _process(
					$gettextInterpolate(
						`<em>%{ subject }</em> followed you.`,
						this.getTranslationValues(notification),
						!plaintext
					)
				);
			}

			case NotificationType.CollaboratorInvite: {
				switch (notification.to_resource) {
					case 'Game':
						return _process(
							$gettextInterpolate(
								`<em>%{ subject }</em> invited you to collaborate on the game <b>%{ object }</b>.`,
								this.getTranslationValues(notification),
								!plaintext
							)
						);
					case 'Community':
						return _process(
							$gettextInterpolate(
								`<em>%{ subject }</em> invited you to collaborate on the <b>%{ object }</b> community.`,
								this.getTranslationValues(notification),
								!plaintext
							)
						);
				}
				break;
			}

			case NotificationType.Mention: {
				const mention = notification.action_model as Mention;

				switch (mention.resource) {
					case 'Comment': {
						if (notification.to_model instanceof Game) {
							return _process(
								$gettextInterpolate(
									`<em>%{ subject }</em> mentioned you in a comment on the game <b>%{ object }</b>.`,
									{
										object: notification.to_model.title,
										subject: this.getSubjectTranslationValue(notification),
									},
									!plaintext
								)
							);
						} else if (notification.to_model instanceof FiresidePost) {
							return _process(
								$gettextInterpolate(
									`<em>%{ subject }</em> mentioned you in a comment on the post <b>%{ object }</b>.`,
									{
										object: notification.to_model.getShortLead(),
										subject: this.getSubjectTranslationValue(notification),
									},
									!plaintext
								)
							);
						} else if (notification.to_model instanceof User) {
							return _process(
								$gettextInterpolate(
									`<em>%{ subject }</em> mentioned you in a shout to @<b>%{ object }</b>.`,
									{
										object: notification.to_model.username,
										subject: this.getSubjectTranslationValue(notification),
									},
									!plaintext
								)
							);
						}
						break;
					}

					case 'Game': {
						return _process(
							$gettextInterpolate(
								`<em>%{ subject }</em> mentioned you in the game <b>%{ object }</b>.`,
								{
									object: (notification.to_model as Game).title,
									subject: this.getSubjectTranslationValue(notification),
								},
								!plaintext
							)
						);
					}

					case 'User': {
						return _process(
							$gettextInterpolate(
								`<em>%{ subject }</em> mentioned you in their user bio.`,
								this.getTranslationValues(notification),
								!plaintext
							)
						);
					}

					case 'Fireside_Post': {
						return _process(
							$gettextInterpolate(
								`<em>%{ subject }</em> mentioned you in the post <b>%{ object }</b>.`,
								{
									object: (notification.to_model as FiresidePost).getShortLead(),
									subject: this.getSubjectTranslationValue(notification),
								},
								!plaintext
							)
						);
					}

					case 'Forum_Post': {
						return _process(
							$gettextInterpolate(
								`<em>%{ subject }</em> mentioned you in a forum post to <b>%{ object }</b>.`,
								{
									object: (notification.to_model as ForumTopic).title,
									subject: this.getSubjectTranslationValue(notification),
								},
								!plaintext
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
				if (notification.action_model instanceof QuestNotification) {
					// TODO(quests) translation support for notifications
					return _process($gettext(notification.action_model.title));
				}

				break;
			}

			case NotificationType.FiresideStart: {
				if (notification.action_model instanceof Fireside) {
					return _process(
						$gettextInterpolate(
							`<em>%{ subject }</em> is live!`,
							this.getTranslationValues(notification),
							!plaintext
						)
					);
				}

				break;
			}

			case NotificationType.FiresideStreamNotification: {
				const users = (notification.action_model as FiresideStreamNotification).users;

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
							$gettextInterpolate(
								`<em>%{ user1 }</em> is live!`,
								userInterpolates,
								!plaintext
							)
						);

					case 2:
						return _process(
							$gettextInterpolate(
								`<em>%{ user1 }</em> and <em>%{ user2 }</em> are live!`,
								userInterpolates,
								!plaintext
							)
						);

					default:
						return _process(
							$gettextInterpolate(
								`<em>%{ user1 }</em>, <em>%{ user2 }</em> and <em>%{ more }</em> more are live!`,
								{
									...userInterpolates,
									more: users.length - 2,
								},
								!plaintext
							)
						);
				}
			}

			case NotificationType.ChargedSticker: {
				if (notification.to_resource === 'Fireside_Post') {
					return _process(
						$gettextInterpolate(
							`<em>%{ subject }</em> placed a charged sticker on your post <b>%{ object }</b>.`,
							this.getTranslationValues(notification),
							!plaintext
						)
					);
				} else if (notification.to_resource === 'Fireside') {
					return _process(
						$gettextInterpolate(
							`<em>%{ subject }</em> placed a charged sticker on your fireside stream.`,
							this.getTranslationValues(notification),
							!plaintext
						)
					);
				}
				break;
			}

			case NotificationType.SupporterMessage: {
				const action =
					notification.action_model instanceof SupporterAction
						? notification.action_model
						: null;

				if (action?.isChargedSticker) {
					return _process(
						$gettextInterpolate(
							`<em>%{ subject }</em> thanked you for giving them a charged sticker.`,
							this.getTranslationValues(notification),
							!plaintext
						)
					);
				}

				return _process(
					$gettextInterpolate(
						`<em>%{ subject }</em> thanked you for supporting them.`,
						this.getTranslationValues(notification),
						!plaintext
					)
				);
			}

			case NotificationType.PollEnded: {
				return _process($gettext(`Poll's closed, results are in!`));
			}

			case NotificationType.CreatorLevelUp: {
				if (notification.action_model instanceof CreatorExperienceLevel) {
					return _process(
						$gettextInterpolate(
							`You've reached <b>Creator Level %{ level }</b>!`,
							{ level: notification.action_model.level },
							!plaintext
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
