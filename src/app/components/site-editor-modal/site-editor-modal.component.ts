import { Component, Output, Inject, Input, EventEmitter } from 'ng-metadata/core';
import * as template from '!html-loader!./site-editor-modal.html';

import { SiteTheme } from '../../../lib/gj-lib-client/components/site/theme/theme-model';
import { Site } from '../../../lib/gj-lib-client/components/site/site-model';
import { SiteTemplate } from '../../../lib/gj-lib-client/components/site/template/template-model';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../lib/gj-lib-client/components/growls/growls.service';

type EditorTab = 'theme' | 'content';

@Component({
	selector: 'gj-site-editor-modal',
	template,
})
export class SiteEditorModalComponent
{
	@Input() siteId: number;
	@Input() initialTab?: EditorTab;

	@Output( 'close' ) private _close = new EventEmitter<void>();

	site: Site;
	templates: SiteTemplate[] = [];
	currentTemplateId?: number;
	theme: SiteTheme;

	isLoaded = false;
	tab: EditorTab;

	private isDirty = false;
	private locationWatcher: Function;

	constructor(
		@Inject( '$rootScope' ) private $rootScope: ng.IRootScopeService,
		@Inject( '$sce' ) private $sce: ng.ISCEService,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( '$location' ) private $location: ng.ILocationService,
	)
	{
		this.tab = this.initialTab || 'theme';

		Api.sendRequest( `/web/dash/sites/editor/${this.siteId}` )
			.then( ( response: any ) =>
			{
				this.isLoaded = true;
				this.site = new Site( response.site );
				this.templates = SiteTemplate.populate( response.templates );

				if ( this.site.theme ) {
					this.currentTemplateId = this.site.theme.template.id;
					this.theme = this.site.theme;
				}
			} );

		this.$location.hash( 'site-editor' );
		setTimeout( () =>
		{
			this.locationWatcher = this.$rootScope.$on( '$locationChangeStart', ( e ) => this.locationChanged( e ) );
		} );
	}

	get siteUrl()
	{
		return this.$sce.trustAsResourceUrl( this.site.url );
	}

	themeEdited( $theme: any )
	{
		this.isDirty = true;
		this.theme.data = $theme;
	}

	contentEdited()
	{
		this.isDirty = true;
	}

	async save()
	{
		const data = {
			template_id: this.currentTemplateId,
			theme: this.theme.data,
			content_blocks: this.site.content_blocks,
		};

		this.isDirty = false;
		await Api.sendRequest( `/web/dash/sites/editor-save/${this.siteId}`, data, { sanitizeComplexData: false } );

		Growls.success(
			this.gettextCatalog.getString( 'Your site has been saved.' ),
			this.gettextCatalog.getString( 'Site Saved' ),
		);
	}

	close()
	{
		window.history.back();
	}

	locationChanged( e: ng.IAngularEvent )
	{
		if ( !this.isDirty || confirm( this.gettextCatalog.getString( 'You have unsaved changes. Are you sure you want to discard them?' ) ) ) {
			this._close.emit( undefined );
			this.locationWatcher();
		}
		else if ( e ) {
			e.preventDefault();
		}
	}
}
