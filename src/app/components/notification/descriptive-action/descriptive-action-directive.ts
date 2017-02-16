import { Component, Inject, Input } from 'ng-metadata/core';
import { Notification } from '../../../../lib/gj-lib-client/components/notification/notification-model';
import * as template from '!html-loader!./descriptive-action.html';

@Component({
	selector: 'gj-notification-descriptive-action',
	template,
})
export class DescriptiveActionComponent
{
	@Input( '<' ) notification: Notification;

	translationKey: string;
	translationValues: Object | null;

	constructor(
		@Inject( 'gettext' ) gettext: ng.gettext.gettextFunction,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'currencyFilter' ) currencyFilter: ng.IFilterCurrency
	)
	{
		const translationKeys = {
			[ Notification.TYPE_COMMENT_ADD_OBJECT_OWNER ]: gettext( 'notifications.new_comment_title_html' ),
			[ Notification.TYPE_COMMENT_ADD ]: gettext( 'notifications.comment_reply_title_html' ),
			[ Notification.TYPE_FORUM_POST_ADD ]: gettext( 'notifications.forum_post_title_html' ),
			[ Notification.TYPE_FRIENDSHIP_REQUEST ]: gettext( 'notifications.friendship_request_title_html' ),
			[ Notification.TYPE_FRIENDSHIP_ACCEPT ]: gettext( 'notifications.friendship_accepted_title_html' ),
			[ Notification.TYPE_GAME_RATING_ADD ]: gettext( 'notifications.rating_title_html' ),
			[ Notification.TYPE_GAME_FOLLOW ]: gettext( 'notifications.game_follow_title_html' ),
			[ Notification.TYPE_SELLABLE_SELL ]: gettext( 'bought a package in <strong>{{ object }}</strong> for <strong>{{ amount }}</strong>.' ),
		};

		this.translationKey = translationKeys[ this.notification.type ];
		this.translationValues = null;

		if ( this.notification.type === Notification.TYPE_SELLABLE_SELL ) {
			this.translationValues = {
				object: this.notification.to_model.title,
				amount: currencyFilter( this.notification.action_model.amount / 100, '$' ),
			};
		}
		else {
			this.translationValues = {
				object: this.notification.to_model.title,
			};
		}
	}

	getAction()
	{
		return this.gettextCatalog.getString( this.translationKey, this.translationValues );
	}
}
