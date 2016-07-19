import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../../../../../app-service';
import { ModalConfirm } from './../../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Notification } from './../../../../../../../../lib/gj-lib-client/components/notification/notification-model';

@Injectable()
export class OverviewCtrl
{
	viewCount: number;
	downloadCount: number;
	playCount: number;
	followerCount: number;
	commentCount: number;

	isPublishable: boolean;
	hasBuildsProcessing: boolean;

	notifications: any[];

	constructor(
		@Inject( 'App' ) app: App,
		@Inject( '$scope' ) private $scope: angular.IScope,
		@Inject( '$state' ) $state: angular.ui.IStateService,
		@Inject( 'ModalConfirm' ) private modalConfirm: ModalConfirm,
		@Inject( 'Notification' ) notificationModel: typeof Notification,
		@Inject( 'Game' ) private gameModel: any,
		@Inject( 'Growls' ) private growls: any,
		@Inject( 'gettextCatalog' ) private gettextCatalog: angular.gettext.gettextCatalog,
		@Inject( 'payload' ) payload: any
	)
	{
		const manageCtrl = $scope['manageCtrl'];
		const game = manageCtrl.game;

		app.title = gettextCatalog.getString( 'dash.games.overview.page_title', { game: game.title } );

		this.viewCount = payload.viewCount || 0;
		this.downloadCount = payload.downloadCount || 0;
		this.playCount = payload.playCount || 0;
		this.followerCount = payload.followerCount || 0;
		this.commentCount = payload.commentCount || 0;

		this.isPublishable = payload.isPublishable || false;
		this.hasBuildsProcessing = payload.hasBuildsProcessing || false;

		this.notifications = payload.notifications ? notificationModel.populate( payload.notifications ) : [];
	}

	publish()
	{
		this.modalConfirm.show( this.gettextCatalog.getString( 'dash.games.overview.publish_confirmation' ) )
			.then( () =>
			{
				return this.$scope['manageCtrl'].game.$setStatus( this.gameModel.STATUS_VISIBLE );
			} )
			.then( function()
			{
				this.Growls.success(
					this.gettextCatalog.getString( 'dash.games.overview.published_growl' ),
					this.gettextCatalog.getString( 'dash.games.overview.published_growl_title' )
				);
			} );
	}

	// This is called if they loaded up the page and had builds in a processing state
	// but then the progress polling eventually found that they were all processed.
	// We just want to give the green light.
	onAllBuildsProcessed()
	{
		this.hasBuildsProcessing = false;
	}
}
