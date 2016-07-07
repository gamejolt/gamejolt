import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../../app-service';
import { ModalConfirm } from './../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';

@Injectable()
export class FeedCtrl
{
	tab: 'feed' | 'notifications' = 'feed';

	notificationTypes: Object[];
	currentNotificationType: Object;

	notifications: any[];
	notificationsCount: number;
	// unreadCounts: { [key: string]: any };

	constructor(
		@Inject( 'App' ) app: App,
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$state' ) $state: ng.ui.IStateService,
		@Inject( '$stateParams' ) $stateParams: ng.ui.IStateParamsService,
		@Inject( 'Notification' ) Notification: any,
		@Inject( 'ModalConfirm' ) ModalConfirm: ModalConfirm,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'payload' ) payload: any
	)
	{
		app.title = gettextCatalog.getString( 'dash.activity.page_title' );

		$scope['Notification'] = Notification;

		// this.tab = $stateParams['tab'];
		// this.filter = $stateParams['filter'];
		// this.page = $stateParams['page'] || 1;

		this.notifications = Notification.populate( payload.notifications );
		this.notificationsCount = payload.notificationsCount || 0;
		// this.unreadCounts = payload.unreadCounts || {};
		// this.unreadCounts[ undefined ] = _.sum( this.unreadCounts ) || null;

		this.notificationTypes = [
			{
				key: 'all',
				label: gettextCatalog.getString( 'notifications.all_label' ),
			},
			{
				key: Notification.TYPE_GAME_NEWS_ADD,
				label: gettextCatalog.getString( 'notifications.game_news_label' ),
			},
			{
				key: Notification.TYPE_COMMENT_ADD,
				label: gettextCatalog.getString( 'notifications.comment_replies_label' ),
			},
			{
				key: Notification.TYPE_FORUM_POST_ADD,
				label: gettextCatalog.getString( 'notifications.forum_posts_label' ),
			},
			{
				key: Notification.TYPE_FRIENDSHIP_ACCEPT,
				label: gettextCatalog.getString( 'notifications.new_friends_label' ),
			},
			{
				key: Notification.TYPE_COMMENT_ADD_OBJECT_OWNER,
				label: gettextCatalog.getString( 'notifications.new_comments_label' ),
			},
			{
				key: Notification.TYPE_GAME_RATING_ADD,
				label: gettextCatalog.getString( 'notifications.game_ratings_label' ),
			},
			{
				key: Notification.TYPE_GAME_FOLLOW,
				label: gettextCatalog.getString( 'notifications.game_follows_label' ),
			},
			{
				key: Notification.TYPE_SELLABLE_SELL,
				label: gettextCatalog.getString( 'Sales' ),
			},
		];

		this.currentNotificationType = _.find( this.notificationTypes, { key: 'all' } );

		// this.filterNotifications();
	}

	// filterNotifications()
	// {
	// 	let wrapped = _( this.notifications );

	// 	if ( $stateParams['filter'] ) {
	// 		wrapped = wrapped.filter( { type: $stateParams.filter } );
	// 	}

	// 	if ( $stateParams.tab == 'unread' ) {
	// 		wrapped = wrapped.filter( function( item )
	// 		{
	// 			return !item.viewed_on;
	// 		} );
	// 	}

	// 	this.filteredNotifications = wrapped.value();
	// }

	// markAllRead()
	// {
	// 	var msg = gettextCatalog.getString( 'notifications.clear_all_confirmation' );
	// 	if ( this.currentNotificationType.key ) {
	// 		msg = gettextCatalog.getString( 'notifications.clear_all_of_type_confirmation' );
	// 	}

	// 	ModalConfirm.show( msg )
	// 		.then( function()
	// 		{
	// 			return Notification.$readAll( _this.currentNotificationType.key );
	// 		} )
	// 		.then( function()
	// 		{
	// 			$state.reload( $state.current );
	// 		} );
	// }

	// getUnreadTooltip( count )
	// {
	// 	gettextCatalog.getPlural( count, 'notifications.unread_tooltip', 'notifications.unread_tooltip', {} );
	// }
}

// angular.module( 'App.Views' ).controller( 'Dashboard.Activity.ListCtrl', function(  )
// {
// 	var _this = this;




// } );
