import { Injectable, Inject } from 'ng-metadata/core';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { SiteEditorModal } from '../../../../../../components/site-editor-modal/site-editor-modal.service';
import { Site } from '../../../../../../../lib/gj-lib-client/components/site/site-model';

@Injectable()
export class SiteCtrl
{
	sites: Site[];
	activeSite?: Site;

	constructor(
		@Inject( '$stateParams' ) private $stateParams: ng.ui.IStateParamsService,
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( 'Meta' ) meta: Meta,
		@Inject( 'Api' ) private api: any,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'SiteEditorModal' ) private editorModal: SiteEditorModal,
		@Inject( 'Site' ) private siteModel: typeof Site,
		@Inject( 'payload' ) payload: any,
	)
	{
		meta.title = gettextCatalog.getString( 'Manage Site' );
		this.sites = this.siteModel.populate( payload.sites );
		this.activeSite = _.find( this.sites, { status: this.siteModel.STATUS_ACTIVE } );
	}

	toggled()
	{
		if ( this.$scope['manageCtrl'].game.sites_enabled ) {
			this.enable();
		}
		else {
			this.disable();
		}
	}

	private enable()
	{
		this.api.sendRequest( `/web/dash/sites/activate/${this.$stateParams['id']}` )
			.then( ( response: any ) =>
			{
				this.$scope['manageCtrl'].game.assign( response.game );
				this.sites = this.siteModel.populate( response.sites );
				this.activeSite = _.find( this.sites, { status: this.siteModel.STATUS_ACTIVE } );
			} );
	}

	private disable()
	{
		this.api.sendRequest( `/web/dash/sites/deactivate/${this.$stateParams['id']}` )
			.then( ( response: any ) =>
			{
				this.$scope['manageCtrl'].game.assign( response.game );
			} );
	}

	showEditor()
	{
		if ( this.activeSite ) {
			this.editorModal.show( this.activeSite.id );
		}
	}
}
