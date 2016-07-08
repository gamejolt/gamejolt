import { Injectable, Inject } from 'ng-metadata/core';
import { Notification } from './../../../../../lib/gj-lib-client/components/notification/notification-model';
import { App } from './../../../../app-service';

@Injectable()
export class FeedCtrl
{
	tab: 'activity' | 'notifications' = 'activity';
	notifications: Notification[];
	notificationsCount: number;

	constructor(
		@Inject( 'App' ) app: App,
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$stateParams' ) $stateParams: ng.ui.IStateParamsService,
		@Inject( 'Notification' ) notificationModel: typeof Notification,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'payload' ) payload: any
	)
	{
		app.title = gettextCatalog.getString( 'dash.activity.page_title' );

		$scope['Notification'] = notificationModel;

		this.tab = $stateParams['tab'];
		this.notifications = notificationModel.populate( payload.notifications );
		this.notificationsCount = payload.notificationsCount || 0;
	}
}
