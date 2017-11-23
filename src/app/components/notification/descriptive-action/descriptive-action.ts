import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./descriptive-action.html';

import { currency } from '../../../../lib/gj-lib-client/vue/filters/currency';
import { Notification } from '../../../../lib/gj-lib-client/components/notification/notification-model';
import { Sellable } from '../../../../lib/gj-lib-client/components/sellable/sellable.model';
import { OrderItem } from '../../../../lib/gj-lib-client/components/order/item/item.model';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { ForumTopic } from '../../../../lib/gj-lib-client/components/forum/topic/topic.model';
import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Mention } from '../../../../lib/gj-lib-client/components/mention/mention.model';
import { assertNever } from '../../../../lib/gj-lib-client/utils/utils';

@View
@Component({})
export class AppNotificationDescriptiveAction extends Vue {
	@Prop(Notification) notification: Notification;

	get translationValues(): any {
		if (
			this.notification.to_model instanceof Game ||
			this.notification.to_model instanceof ForumTopic ||
			this.notification.to_model instanceof FiresidePost
		) {
			return {
				object: this.notification.to_model.title,
			};
		}

		return {};
	}

	get action() {
		const notification = this.notification;

		switch (notification.type) {
			case Notification.TYPE_COMMENT_ADD_OBJECT_OWNER: {
				return this.$gettextInterpolate(`commented on <b>%{ object }</b>.`, this.translationValues);
			}

			case Notification.TYPE_COMMENT_ADD: {
				return this.$gettextInterpolate(
					`replied to your comment on <b>%{ object }</b>.`,
					this.translationValues
				);
			}

			case Notification.TYPE_FORUM_POST_ADD: {
				return this.$gettextInterpolate(
					`posted a new forum post to <b>%{ object }</b>.`,
					this.translationValues
				);
			}

			case Notification.TYPE_FRIENDSHIP_REQUEST: {
				return this.$gettext(`sent you a friend request.`);
			}

			case Notification.TYPE_FRIENDSHIP_ACCEPT: {
				return this.$gettext(`accepted your friend request.`);
			}

			case Notification.TYPE_GAME_RATING_ADD: {
				return this.$gettext(`received a new rating.`);
			}

			case Notification.TYPE_GAME_FOLLOW: {
				return this.$gettextInterpolate(`followed <b>%{ object }</b>.`, this.translationValues);
			}

			case Notification.TYPE_SELLABLE_SELL: {
				const sellable = notification.to_model as Sellable;
				const orderItem = notification.action_model as OrderItem;
				const translationValues = {
					object: sellable.title,
					amount: currency(orderItem.amount),
				};

				return this.$gettextInterpolate(
					`bought a package in <b>%{ object }</b> for <b>%{ amount }</b>.`,
					translationValues
				);
			}

			case Notification.TYPE_USER_FOLLOW: {
				return this.$gettext(`followed you.`);
			}

			case Notification.TYPE_COLLABORATOR_INVITE: {
				return this.$gettextInterpolate(
					`invited you to collaborate on <b>%{ object }</b>.`,
					this.translationValues
				);
			}

			case Notification.TYPE_MENTION: {
				const mention = notification.action_model as Mention;

				switch (mention.resource) {
					case 'Comment': {
						if (notification.to_model instanceof Game) {
							return this.$gettextInterpolate(
								`mentioned you in a comment on the game <b>%{ object }</b>.`,
								{ object: notification.to_model.title }
							);
						} else if (notification.to_model instanceof FiresidePost) {
							return this.$gettextInterpolate(
								`mentioned you in a comment on the post <b>%{ object }</b>.`,
								{ object: notification.to_model.title }
							);
						}
						break;
					}

					case 'Game': {
						return this.$gettextInterpolate(`mentioned you in the game <b>%{ object }</b>.`, {
							object: (notification.to_model as Game).title,
						});
					}

					case 'User': {
						return this.$gettext(`mentioned you in their user bio.`);
					}

					case 'Fireside_Post': {
						return this.$gettextInterpolate(`mentioned you in the post <b>%{ object }</b>.`, {
							object: (notification.to_model as FiresidePost).title,
						});
					}

					case 'Forum_Post': {
						return this.$gettextInterpolate(
							`mentioned you in a forum post to <b>%{ object }</b>.`,
							{ object: (notification.to_model as ForumTopic).title }
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
