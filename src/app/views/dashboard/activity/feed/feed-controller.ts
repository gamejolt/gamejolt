import { Injectable, Inject } from 'ng-metadata/core';
import { Notification } from './../../../../../lib/gj-lib-client/components/notification/notification-model';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { ActivityFeedContainer } from './../../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from './../../../../components/activity/feed/feed-service';
import { App } from './../../../../app-service';
import { ActivityCtrl } from '../activity-controller';

@Injectable()
export class FeedCtrl
{
	tab: 'activity' | 'notifications' = 'activity';
	feed: ActivityFeedContainer;

	constructor(
		@Inject( 'App' ) app: App,
		@Inject( '$rootScope' ) $rootScope: ng.IRootScopeService,
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$stateParams' ) $stateParams: ng.ui.IStateParamsService,
		@Inject( 'Notification' ) notificationModel: typeof Notification,
		@Inject( 'Fireside_Post' ) postModel: typeof Fireside_Post,
		@Inject( 'ActivityFeedService' ) feedService: ActivityFeedService,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'payload' ) payload: any
	)
	{
		$scope['Notification'] = notificationModel;
		const activityCtrl: ActivityCtrl = $scope['activityCtrl'];

		this.tab = $stateParams['tab'];

		if ( this.tab == 'activity' ) {
			app.title = gettextCatalog.getString( 'Your activity feed' );
			this.feed = feedService.bootstrap( postModel.populate( payload.items ), {
				notificationWatermark: payload.unreadWatermark,
			} );
		}
		else {
			app.title = gettextCatalog.getString( 'Your notifications' );
			this.feed = feedService.bootstrap( notificationModel.populate( payload.items ), {
				notificationWatermark: payload.unreadWatermark,
			} );
		}

		activityCtrl.activityUnreadCount = payload.activityUnreadCount || 0;
		activityCtrl.notificationsUnreadCount = payload.notificationsUnreadCount || 0;

		// Update the notification count directive to show the new unread count.
		$rootScope.$broadcast( 'NotificationCount.refresh' );
	}
}
