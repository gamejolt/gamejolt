import { Injectable, Inject } from 'ng-metadata/core';
import { StateParams } from 'angular-ui-router';

import { Notification } from '../../../../../lib/gj-lib-client/components/notification/notification-model';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { ActivityFeedContainer } from '../../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { App } from '../../../../app-service';
import { ActivityCtrl } from '../activity-controller';

@Injectable( 'Dashboard.Activity.FeedCtrl' )
export class FeedCtrl
{
	tab: 'activity' | 'notifications' = 'activity';
	feed: ActivityFeedContainer;

	constructor(
		@Inject( 'App' ) app: App,
		@Inject( '$rootScope' ) $rootScope: ng.IRootScopeService,
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$stateParams' ) $stateParams: StateParams,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'payload' ) payload: any
	)
	{
		$scope['Notification'] = Notification;
		const activityCtrl: ActivityCtrl = $scope['activityCtrl'];

		this.tab = $stateParams['tab'];

		if ( this.tab == 'activity' ) {
			app.title = gettextCatalog.getString( 'Your activity feed' );
			this.feed = ActivityFeedService.bootstrap( FiresidePost.populate( payload.items ), {
				notificationWatermark: payload.unreadWatermark,
			} );
		}
		else {
			app.title = gettextCatalog.getString( 'Your notifications' );
			this.feed = ActivityFeedService.bootstrap( Notification.populate( payload.items ), {
				notificationWatermark: payload.unreadWatermark,
			} );
		}

		activityCtrl.activityUnreadCount = payload.activityUnreadCount || 0;
		activityCtrl.notificationsUnreadCount = payload.notificationsUnreadCount || 0;

		// Update the notification count directive to show the new unread count.
		$rootScope.$broadcast( 'NotificationCount.refresh' );
	}
}
