import { Injectable, Inject } from 'ng-metadata/core';
import { Notification } from './../../../../../lib/gj-lib-client/components/notification/notification-model';
import { ActivityFeedContainer } from './../../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from './../../../../components/activity/feed/feed-service';
import { App } from './../../../../app-service';

@Injectable()
export class FeedCtrl
{
	tab: 'activity' | 'notifications' = 'activity';
	notificationsCount: number;
	notifications: ActivityFeedContainer;

	constructor(
		@Inject( 'App' ) app: App,
		@Inject( '$scope' ) $scope: angular.IScope,
		@Inject( '$stateParams' ) $stateParams: angular.ui.IStateParamsService,
		@Inject( 'Notification' ) notificationModel: typeof Notification,
		@Inject( 'ActivityFeedService' ) feedService: ActivityFeedService,
		@Inject( 'gettextCatalog' ) gettextCatalog: angular.gettext.gettextCatalog,
		@Inject( 'payload' ) payload: any
	)
	{
		app.title = gettextCatalog.getString( 'dash.activity.page_title' );

		$scope['Notification'] = notificationModel;

		this.tab = $stateParams['tab'];
		this.notificationsCount = payload.notificationsCount || 0;
		this.notifications = feedService.bootstrap( notificationModel.populate( payload.notifications ) );
	}

	// this.loadMorePosts = function()
	// {
	// 	var _this = this;
	// 	var lastPost = this.posts[ this.posts.length - 1 ];
	// 	Api.sendRequest( '/web/discover/games/posts/' + $stateParams.id + '/' + lastPost.id )
	// 		.then( function( response )
	// 		{
	// 			_this.posts = _this.posts.concat( Fireside_Post.populate( response.posts ) );
	// 			ActivityFeedService.store( _this.posts );
	// 		} );
	// };

	// onPostRemoved( post )
	// {
	// 	_.remove( this.posts, { id: post.id } );
	// }
}
