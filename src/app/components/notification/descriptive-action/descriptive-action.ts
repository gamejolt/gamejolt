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

@View
@Component({})
export class AppNotificationDescriptiveAction extends Vue {
	@Prop(Notification) notification: Notification;

	get translationValues(): any {
		if (this.notification.type === Notification.TYPE_SELLABLE_SELL) {
			const sellable = this.notification.to_model as Sellable;
			const orderItem = this.notification.action_model as OrderItem;
			return {
				object: sellable.title,
				amount: currency(orderItem.amount),
			};
		} else if (
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
		switch (this.notification.type) {
			case Notification.TYPE_COMMENT_ADD_OBJECT_OWNER:
				return this.$gettextInterpolate(`commented on <b>%{ object }</b>.`, this.translationValues);

			case Notification.TYPE_COMMENT_ADD:
				return this.$gettextInterpolate(
					`replied to your comment on <b>%{ object }</b>.`,
					this.translationValues
				);

			case Notification.TYPE_FORUM_POST_ADD:
				return this.$gettextInterpolate(
					`posted a new reply to <b>%{ object }</b>.`,
					this.translationValues
				);

			case Notification.TYPE_FRIENDSHIP_REQUEST:
				return this.$gettext(`sent you a friend request.`);

			case Notification.TYPE_FRIENDSHIP_ACCEPT:
				return this.$gettext(`accepted your friend request.`);

			case Notification.TYPE_GAME_RATING_ADD:
				return this.$gettext(`received a new rating.`);

			case Notification.TYPE_GAME_FOLLOW:
				return this.$gettextInterpolate(`followed <b>%{ object }</b>.`, this.translationValues);

			case Notification.TYPE_SELLABLE_SELL:
				return this.$gettextInterpolate(
					`bought a package in <b>%{ object }</b> for <b>%{ amount }</b>.`,
					this.translationValues
				);

			case Notification.TYPE_USER_FOLLOW:
				return this.$gettext(`followed you.`);

			case Notification.TYPE_COLLABORATOR_INVITE:
				return this.$gettextInterpolate(
					`invited you to collaborate on <b>%{ object }</b>.`,
					this.translationValues
				);
		}
	}
}
