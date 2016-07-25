import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../../../../../app-service';
import { Notification } from './../../../../../../../../lib/gj-lib-client/components/notification/notification-model';

@Injectable()
export class OverviewCtrl
{
	viewCount: number;
	downloadCount: number;
	playCount: number;
	commentCount: number;

	hasBuildsProcessing: boolean;

	notifications: any[];

	constructor(
		@Inject( 'App' ) app: App,
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( 'Notification' ) notificationModel: typeof Notification,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'payload' ) payload: any
	)
	{
		const manageCtrl = $scope['manageCtrl'];
		const game = manageCtrl.game;

		app.title = gettextCatalog.getString( 'dash.games.overview.page_title', { game: game.title } );

		this.viewCount = payload.viewCount || 0;
		this.downloadCount = payload.downloadCount || 0;
		this.playCount = payload.playCount || 0;
		this.commentCount = payload.commentCount || 0;

		this.hasBuildsProcessing = payload.hasBuildsProcessing || false;

		this.notifications = payload.notifications ? notificationModel.populate( payload.notifications ) : [];
	}

	// This is called if they loaded up the page and had builds in a processing state
	// but then the progress polling eventually found that they were all processed.
	// We just want to give the green light.
	onAllBuildsProcessed()
	{
		this.hasBuildsProcessing = false;
	}
}
