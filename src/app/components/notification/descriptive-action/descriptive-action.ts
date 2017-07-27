import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./descriptive-action.html';

import { currency } from '../../../../lib/gj-lib-client/vue/filters/currency';
import { Notification } from '../../../../lib/gj-lib-client/components/notification/notification-model';

@View
@Component({})
export class AppNotificationDescriptiveAction extends Vue {
	@Prop(Notification) notification: Notification;

	get translationValues(): any {
		if (this.notification.type === Notification.TYPE_SELLABLE_SELL) {
			return {
				object: this.notification.to_model.title,
				amount: currency(this.notification.action_model.amount / 100),
			};
		}

		return {
			object: this.notification.to_model.title,
		};
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
				return this.$gettextInterpolate(`sent you a friend request.`, this.translationValues);

			case Notification.TYPE_FRIENDSHIP_ACCEPT:
				return this.$gettextInterpolate(`accepted your friend request.`, this.translationValues);

			case Notification.TYPE_GAME_RATING_ADD:
				return this.$gettextInterpolate(`received a new rating.`, this.translationValues);

			case Notification.TYPE_GAME_FOLLOW:
				return this.$gettextInterpolate(`followed <b>%{ object }</b>.`, this.translationValues);

			case Notification.TYPE_SELLABLE_SELL:
				return this.$gettextInterpolate(
					`bought a package in <b>%{ object }</b> for <b>%{ amount }</b>.`,
					this.translationValues
				);
		}
	}
}
