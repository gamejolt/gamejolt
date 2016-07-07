import { Component, Inject, Input } from 'ng-metadata/core';
import template from './descriptive-action.html';

@Component({
	selector: 'gj-notification-descriptive-action',
	template,
})
export class DescriptiveActionComponent
{
	@Input( '<' ) notification: any;
	@Input( '<' ) inPopover = false;

	translationKey: string;
	translationValues: Object;

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( 'Notification' ) notificationModel: any,
		@Inject( 'gettext' ) gettext: ng.gettext.gettextFunction,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'currencyFilter' ) currencyFilter: ng.IFilterCurrency
	)
	{
		const translationKeys = {
			[ notificationModel.TYPE_COMMENT_ADD_OBJECT_OWNER ]: gettext( 'notifications.new_comment_title_html' ),
			[ notificationModel.TYPE_COMMENT_ADD ]: gettext( 'notifications.comment_reply_title_html' ),
			[ notificationModel.TYPE_FORUM_POST_ADD ]: gettext( 'notifications.forum_post_title_html' ),
			[ notificationModel.TYPE_FRIENDSHIP_REQUEST ]: gettext( 'notifications.friendship_request_title_html' ),
			[ notificationModel.TYPE_FRIENDSHIP_ACCEPT ]: gettext( 'notifications.friendship_accepted_title_html' ),
			[ notificationModel.TYPE_GAME_RATING_ADD ]: gettext( 'notifications.rating_title_html' ),
			[ notificationModel.TYPE_GAME_FOLLOW ]: gettext( 'notifications.game_follow_title_html' ),
			[ notificationModel.TYPE_GAME_NEWS_ADD ]: gettext( 'notifications.game_news_title_html' ),
			[ notificationModel.TYPE_SELLABLE_SELL ]: gettext( 'bought a package in <strong>{{ object }}</strong> for <strong>{{ amount }}</strong>.' ),
		};

		this.translationKey = translationKeys[ this.notification.type ];
		this.translationValues = null;

		if ( this.notification.type == notificationModel.TYPE_GAME_RATING_ADD ) {
			if ( this.inPopover ) {
				this.translationKey = gettext( 'notifications.rating_title_popover_html' );
			}
		}
		else if ( this.notification.type == notificationModel.TYPE_GAME_NEWS_ADD ) {
			if ( this.inPopover ) {
				this.translationKey = gettext( 'notifications.game_news_title_popover_html' );
			}

			this.translationValues = {
				title: this.notification.action_model.title,
			};
		}
		else if ( this.notification.type == notificationModel.TYPE_SELLABLE_SELL ) {
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
