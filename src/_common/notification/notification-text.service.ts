import { assertNever } from '../../utils/utils';
import { CommentVideo } from '../comment/video/video-model';
import { Community } from '../community/community.model';
import {
	CommunityUserNotification,
	NotificationType,
} from '../community/user-notification/user-notification.model';
import { currency } from '../filters/currency';
import { FiresidePostCommunity } from '../fireside/post/community/community.model';
import { FiresidePost } from '../fireside/post/post-model';
import { ForumTopic } from '../forum/topic/topic.model';
import { Game } from '../game/game.model';
import { GameTrophy } from '../game/trophy/trophy.model';
import { Mention } from '../mention/mention.model';
import { OrderItem } from '../order/item/item.model';
import { Sellable } from '../sellable/sellable.model';
import { SiteTrophy } from '../site/trophy/trophy.model';
import { Translate } from '../translate/translate.service';
import { UserGameTrophy } from '../user/trophy/game-trophy.model';
import { UserSiteTrophy } from '../user/trophy/site-trophy.model';
import { User } from '../user/user.model';
import { Notification } from './notification-model';

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
				return Translate.$gettext('Someone');
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
		let output = { subject } as any;

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
				output.object = Translate.$gettext('them');
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
			case Notification.TYPE_POST_ADD: {
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

			case Notification.TYPE_POST_FEATURED_IN_COMMUNITY: {
				const postCommunity = notification.action_model as FiresidePostCommunity;

				return _process(
					Translate.$gettextInterpolate(
						`Your post in the <em>%{ community }</em> community has been featured!`,
						{
							community: postCommunity.community.name,
						},
						!plaintext
					)
				);
			}

			case Notification.TYPE_COMMUNITY_USER_NOTIFICATION:
				{
					const userNotification = notification.action_model as CommunityUserNotification;

					switch (userNotification.type) {
						case NotificationType.POSTS_MOVE:
							return _process(
								Translate.$gettextInterpolate(
									`Your post in the <em>%{ community }</em> community has been <b>moved</b> to a different channel.`,
									{
										community: userNotification.community.name,
									},
									!plaintext
								)
							);
						case NotificationType.POSTS_EJECT:
							return _process(
								Translate.$gettextInterpolate(
									`Your post has been <b>ejected</b> from the <em>%{ community }</em> community.`,
									{
										community: userNotification.community.name,
									},
									!plaintext
								)
							);
					}
				}
				break;

			case Notification.TYPE_GAME_TROPHY_ACHIEVED: {
				if (
					notification.action_model instanceof UserGameTrophy &&
					notification.action_model.trophy instanceof GameTrophy &&
					notification.action_model.game instanceof Game
				) {
					return _process(
						Translate.$gettextInterpolate(
							`You achieved <em>%{ trophyTitle }</em> on <b>%{ gameTitle }</b>!`,
							{
								trophyTitle: notification.action_model.trophy.title,
								gameTitle: notification.action_model.game.title,
							},
							!plaintext
						)
					);
				}
				return '';
			}

			case Notification.TYPE_SITE_TROPHY_ACHIEVED: {
				if (
					notification.action_model instanceof UserSiteTrophy &&
					notification.action_model.trophy instanceof SiteTrophy
				) {
					return _process(
						Translate.$gettextInterpolate(
							`You achieved the Game Jolt Trophy <em>%{ trophyTitle }</em>!`,
							{
								trophyTitle: notification.action_model.trophy.title,
							},
							!plaintext
						)
					);
				}
				return '';
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
							this.getTranslationValues(notification),
							!plaintext
						)
					);
				} else {
					return _process(
						Translate.$gettextInterpolate(
							`<em>%{ subject }</em> commented on <b>%{ object }</b>.`,
							this.getTranslationValues(notification),
							!plaintext
						)
					);
				}
			}

			case Notification.TYPE_COMMENT_ADD: {
				if (notification.to_model instanceof User) {
					return _process(
						Translate.$gettextInterpolate(
							`<em>%{ subject }</em> replied to your shout to <b>%{ object }</b>.`,
							this.getTranslationValues(notification),
							!plaintext
						)
					);
				} else {
					return _process(
						Translate.$gettextInterpolate(
							`<em>%{ subject }</em> replied to your comment on <b>%{ object }</b>.`,
							this.getTranslationValues(notification),
							!plaintext
						)
					);
				}
			}

			case Notification.TYPE_FORUM_POST_ADD: {
				return _process(
					Translate.$gettextInterpolate(
						`<em>%{ subject }</em> posted a new forum post to <b>%{ object }</b>.`,
						this.getTranslationValues(notification),
						!plaintext
					)
				);
			}

			case Notification.TYPE_FRIENDSHIP_REQUEST: {
				return _process(
					Translate.$gettextInterpolate(
						`<em>%{ subject }</em> sent you a friend request.`,
						this.getTranslationValues(notification),
						!plaintext
					)
				);
			}

			case Notification.TYPE_FRIENDSHIP_ACCEPT: {
				return _process(
					Translate.$gettextInterpolate(
						`<em>%{ subject }</em> accepted your friend request.`,
						this.getTranslationValues(notification),
						!plaintext
					)
				);
			}

			case Notification.TYPE_GAME_RATING_ADD: {
				return _process(
					Translate.$gettextInterpolate(
						`<em>%{ subject }</em> liked <b>%{ object }</b>.`,
						this.getTranslationValues(notification),
						!plaintext
					)
				);
			}

			case Notification.TYPE_GAME_FOLLOW: {
				return _process(
					Translate.$gettextInterpolate(
						`<em>%{ subject }</em> followed <b>%{ object }</b>.`,
						this.getTranslationValues(notification),
						!plaintext
					)
				);
			}

			case Notification.TYPE_SELLABLE_SELL: {
				const sellable = notification.to_model as Sellable;
				const orderItem = notification.action_model as OrderItem;
				const translationValues = {
					object: sellable.title,
					amount: currency(orderItem.amount),
					subject: this.getSubjectTranslationValue(notification),
				};

				return _process(
					Translate.$gettextInterpolate(
						`<em>%{ subject }</em> bought a package in <b>%{ object }</b> for %{ amount }.`,
						translationValues,
						!plaintext
					)
				);
			}

			case Notification.TYPE_USER_FOLLOW: {
				return _process(
					Translate.$gettextInterpolate(
						`<em>%{ subject }</em> followed you.`,
						this.getTranslationValues(notification),
						!plaintext
					)
				);
			}

			case Notification.TYPE_COLLABORATOR_INVITE: {
				switch (notification.to_resource) {
					case 'Game':
						return _process(
							Translate.$gettextInterpolate(
								`<em>%{ subject }</em> invited you to collaborate on the game <b>%{ object }</b>.`,
								this.getTranslationValues(notification),
								!plaintext
							)
						);
					case 'Community':
						return _process(
							Translate.$gettextInterpolate(
								`<em>%{ subject }</em> invited you to collaborate on the <b>%{ object }</b> community.`,
								this.getTranslationValues(notification),
								!plaintext
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
										subject: this.getSubjectTranslationValue(notification),
									},
									!plaintext
								)
							);
						} else if (notification.to_model instanceof FiresidePost) {
							return _process(
								Translate.$gettextInterpolate(
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
								Translate.$gettextInterpolate(
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
							Translate.$gettextInterpolate(
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
							Translate.$gettextInterpolate(
								`<em>%{ subject }</em> mentioned you in their user bio.`,
								this.getTranslationValues(notification),
								!plaintext
							)
						);
					}

					case 'Fireside_Post': {
						return _process(
							Translate.$gettextInterpolate(
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
							Translate.$gettextInterpolate(
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
						return assertNever(mention.resource);
					}
				}
			}
		}
	}
}
