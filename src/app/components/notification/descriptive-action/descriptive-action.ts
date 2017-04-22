import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./descriptive-action.html';

import { currency } from '../../../../lib/gj-lib-client/vue/filters/currency';
import { Notification } from '../../../../lib/gj-lib-client/components/notification/notification-model';

@View
@Component({})
export class AppNotificationDescriptiveAction extends Vue
{
	@Prop( Notification ) notification: Notification;

	// constructor(
	// 	@Inject( 'gettext' ) gettext: ng.gettext.gettextFunction,
	// 	@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
	// 	@Inject( 'currencyFilter' ) currencyFilter: ng.IFilterCurrency
	// )
	// {
	// 	const translationKeys = {
	// 		[ Notification.TYPE_COMMENT_ADD_OBJECT_OWNER ]: gettext( 'notifications.new_comment_title_html' ),
	// 		[ Notification.TYPE_COMMENT_ADD ]: gettext( 'notifications.comment_reply_title_html' ),
	// 		[ Notification.TYPE_FORUM_POST_ADD ]: gettext( 'notifications.forum_post_title_html' ),
	// 		[ Notification.TYPE_FRIENDSHIP_REQUEST ]: gettext( 'notifications.friendship_request_title_html' ),
	// 		[ Notification.TYPE_FRIENDSHIP_ACCEPT ]: gettext( 'notifications.friendship_accepted_title_html' ),
	// 		[ Notification.TYPE_GAME_RATING_ADD ]: gettext( 'notifications.rating_title_html' ),
	// 		[ Notification.TYPE_GAME_FOLLOW ]: gettext( 'notifications.game_follow_title_html' ),
	// 		[ Notification.TYPE_SELLABLE_SELL ]: gettext( 'bought a package in <strong>{{ object }}</strong> for <strong>{{ amount }}</strong>.' ),
	// 	};

	// 	this.translationKey = translationKeys[ this.notification.type ];
	// 	this.translationValues = null;

	// 	if ( this.notification.type === Notification.TYPE_SELLABLE_SELL ) {
	// 		this.translationValues = {
	// 			object: this.notification.to_model.title,
	// 			amount: currencyFilter( this.notification.action_model.amount / 100, '$' ),
	// 		};
	// 	}
	// 	else {
	// 		this.translationValues = {
	// 			object: this.notification.to_model.title,
	// 		};
	// 	}
	// }

	get translationValues(): any
	{
		if ( this.notification.type === Notification.TYPE_SELLABLE_SELL ) {
			return {
				object: this.notification.to_model.title,
				amount: currency( this.notification.action_model.amount / 100 ),
			};
		}

		return {
			object: this.notification.to_model.title,
		};
	}

	get action()
	{
		switch ( this.notification.type ) {
			case Notification.TYPE_COMMENT_ADD_OBJECT_OWNER:
				return this.$gettextInterpolate(
					`commented on <b>%{ object }</b>.`,
					this.translationValues,
				);

			case Notification.TYPE_COMMENT_ADD:
				return this.$gettextInterpolate(
					`replied to your comment on <b>%{ object }</b>.`,
					this.translationValues,
				);

			case Notification.TYPE_FORUM_POST_ADD:
				return this.$gettextInterpolate(
					`posted a new reply to <b>%{ object }</b>.`,
					this.translationValues,
				);

			case Notification.TYPE_FRIENDSHIP_REQUEST:
				return this.$gettextInterpolate(
					`sent you a friend request.`,
					this.translationValues,
				);

			case Notification.TYPE_FRIENDSHIP_ACCEPT:
				return this.$gettextInterpolate(
					`accepted your friend request.`,
					this.translationValues,
				);

			case Notification.TYPE_GAME_RATING_ADD:
				return this.$gettextInterpolate(
					`received a new rating.`,
					this.translationValues,
				);

			case Notification.TYPE_GAME_FOLLOW:
				return this.$gettextInterpolate(
					`followed <b>%{ object }</b>.`,
					this.translationValues,
				);

			case Notification.TYPE_SELLABLE_SELL:
				return this.$gettextInterpolate(
					`bought a package in <b>%{ object }</b> for <b>%{ amount }</b>.`,
					this.translationValues,
				);
		}
	}
}
