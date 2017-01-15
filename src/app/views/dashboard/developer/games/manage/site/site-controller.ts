import { Injectable, Inject } from 'ng-metadata/core';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { SiteEditorModal } from '../../../../../../components/site-editor-modal/site-editor-modal.service';
import { Site } from '../../../../../../../lib/gj-lib-client/components/site/site-model';
import { SiteBuild } from '../../../../../../../lib/gj-lib-client/components/site/build/build-model';

@Injectable()
export class SiteCtrl
{
	site?: Site;
	builds: SiteBuild[];

	constructor(
		@Inject( '$stateParams' ) private $stateParams: ng.ui.IStateParamsService,
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( 'Meta' ) meta: Meta,
		@Inject( 'Api' ) private api: any,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'SiteEditorModal' ) private editorModal: SiteEditorModal,
		@Inject( 'Site' ) private siteModel: typeof Site,
		@Inject( 'SiteBuild' ) public buildModel: typeof SiteBuild,
		@Inject( 'payload' ) payload: any,
	)
	{
		meta.title = gettextCatalog.getString( 'Manage Site' );
		this.site = payload.site ? new this.siteModel( payload.site ) : undefined;
		this.builds = this.buildModel.populate( payload.builds );
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
				this.site = new this.siteModel( response.site );
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
		if ( this.site ) {
			this.editorModal.show( this.site.id );
		}
	}

	onBuildAdded( formModel: any )
	{
		this.builds.unshift( new this.buildModel( formModel ) );
	}

	activateBuild( build: SiteBuild )
	{
		build.$activate().then( () =>
		{
			this.builds.forEach( ( b ) => b.status = b.id === build.id ? SiteBuild.STATUS_ACTIVE : SiteBuild.STATUS_INACTIVE );
		} );
	}

	removeBuild( build: SiteBuild )
	{
		build.$remove().then( () =>
		{
			_.remove( this.builds, { id: build.id } );
		} );
	}
}
