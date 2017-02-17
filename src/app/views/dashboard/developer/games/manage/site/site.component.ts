import { Component, OnInit, Input, Inject } from 'ng-metadata/core';
import { Transition } from 'angular-ui-router';
import * as template from '!html-loader!./site.component.html';

import { Site } from '../../../../../../../lib/gj-lib-client/components/site/site-model';
import { SiteBuild } from '../../../../../../../lib/gj-lib-client/components/site/build/build-model';
import { SiteEditorModal } from '../../../../../../components/site-editor-modal/site-editor-modal.service';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { Game } from '../../../../../../../lib/gj-lib-client/components/game/game.model';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';

@Component({
	selector: 'route-dashboard-developer-games-manage-site',
	template,
})
export class RouteSiteComponent implements OnInit
{
	@Input() payload: any;
	@Input() $transition$: Transition;

	@Input() game: Game;

	SiteBuild = SiteBuild;

	tab: 'template' | 'static' = 'template';
	site?: Site;

	constructor(
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'Growls' ) private Growls: any,
		@Inject( 'SiteEditorModal' ) private editorModal: SiteEditorModal,
	)
	{
		Meta.title = this.gettextCatalog.getString( 'Manage Site' );
	}

	ngOnInit()
	{
		this.site = this.payload.site ? new Site( this.payload.site ) : undefined;
	}

	get staticEnabled()
	{
		return this.game.sites_enabled && this.site && this.site.is_static;
	}

	get customizableEnabled()
	{
		return this.game.sites_enabled && this.site && !this.site.is_static;
	}

	async enable()
	{
		const response = await Api.sendRequest( `/web/dash/sites/activate/${this.$transition$.params().id}`, {} );
		this.game.assign( response.game );
		this.site = new Site( response.site );
	}

	async disable()
	{
		const response = await Api.sendRequest( `/web/dash/sites/deactivate/${this.$transition$.params().id}`, {} );
		this.game.assign( response.game );
	}

	showEditor()
	{
		if ( this.site ) {
			this.editorModal.show( this.site.id );
		}
	}

	onSettingsSaved()
	{
		this.Growls.success(
			this.gettextCatalog.getString( `Your site settings have been saved.` ),
			this.gettextCatalog.getString( `Settings Saved` ),
		);
	}

	onBuildAdded( response: any )
	{
		// Only alert if they had a build previously and uploaded a new one.
		if ( this.site!.build ) {
			this.Growls.success(
				this.gettextCatalog.getString( `Your new site build is now active.` ),
				this.gettextCatalog.getString( `Site Updated` ),
			);
		}

		this.game.assign( response.game );
		this.site = new Site( response.site );
	}

	async activateBuild()
	{
		if ( !this.site || !this.site.build ) {
			return;
		}

		const response = await Api.sendRequest( `/web/dash/sites/activate-primary-build/${this.site.id}`, {} );
		this.game.assign( response.game );
		this.site = new Site( response.site );
	}
}
