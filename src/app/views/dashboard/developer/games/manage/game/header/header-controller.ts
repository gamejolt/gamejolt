import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../../../../../app-service';
import { ModalConfirm } from './../../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Popover } from '../../../../../../../../lib/gj-lib-client/components/popover/popover.service';

@Injectable()
export class HeaderCtrl
{
	constructor(
		@Inject( 'App' ) app: App,
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( 'Popover' ) private popover: Popover,
		@Inject( 'Scroll' ) private scroll: any,
		@Inject( 'Growls' ) private growls: any,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'ModalConfirm' ) private confirm: ModalConfirm,
	)
	{
		app.title = gettextCatalog.getString( 'dash.games.header.page_title', { game: $scope['manageCtrl'].game.title } );
	}

	clearHeader()
	{
		this.popover.hideAll();
		this.confirm.show( this.gettextCatalog.getString( 'Are you sure you want to remove your game header?' ), undefined, 'yes' )
			.then( () => this.$scope['manageCtrl'].game.$clearHeader() );
	}

	onSaved()
	{
		this.growls.success(
			this.gettextCatalog.getString( 'dash.games.header.saved_growl' ),
			this.gettextCatalog.getString( 'dash.games.header.saved_growl_title' )
		);
		this.scroll.to( 0 );
	}
}
