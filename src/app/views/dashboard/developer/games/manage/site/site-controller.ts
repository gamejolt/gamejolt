import { Injectable, Inject } from 'ng-metadata/core';
import { StateParams } from 'angular-ui-router';

import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { SiteEditorModal } from '../../../../../../components/site-editor-modal/site-editor-modal.service';
import { Site } from '../../../../../../../lib/gj-lib-client/components/site/site-model';
import { SiteBuild } from '../../../../../../../lib/gj-lib-client/components/site/build/build-model';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';

@Injectable()
export class SiteCtrl
{
	site?: Site;
	builds: SiteBuild[];

	constructor(
		@Inject( '$stateParams' ) private $stateParams: StateParams,
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'SiteEditorModal' ) private editorModal: SiteEditorModal,
		@Inject( 'payload' ) payload: any,
	)
	{
		Meta.title = gettextCatalog.getString( 'Manage Site' );
		this.site = payload.site ? new Site( payload.site ) : undefined;
		this.builds = SiteBuild.populate( payload.builds );
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

	private async enable()
	{
		const response = await Api.sendRequest( `/web/dash/sites/activate/${this.$stateParams['id']}` );
		this.$scope['manageCtrl'].game.assign( response.game );
		this.site = new Site( response.site );
	}

	private async disable()
	{
		const response = await Api.sendRequest( `/web/dash/sites/deactivate/${this.$stateParams['id']}` );
		this.$scope['manageCtrl'].game.assign( response.game );
	}

	showEditor()
	{
		if ( this.site ) {
			this.editorModal.show( this.site.id );
		}
	}

	onBuildAdded( formModel: any )
	{
		this.builds.unshift( new SiteBuild( formModel ) );
	}

	async activateBuild( build: SiteBuild )
	{
		await build.$activate();
		this.builds.forEach( ( b ) => b.status = b.id === build.id ? SiteBuild.STATUS_ACTIVE : SiteBuild.STATUS_INACTIVE );
	}

	async removeBuild( build: SiteBuild )
	{
		await build.$remove();
		_.remove( this.builds, { id: build.id } );
	}
}
