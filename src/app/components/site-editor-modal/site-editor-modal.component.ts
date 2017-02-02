import { Component, Output, Inject, Input, EventEmitter } from 'ng-metadata/core';
import * as template from '!html-loader!./site-editor-modal.html';

import { SiteTheme } from '../../../lib/gj-lib-client/components/site/theme/theme-model';
import { Site } from '../../../lib/gj-lib-client/components/site/site-model';
import { SiteTemplate } from '../../../lib/gj-lib-client/components/site/template/template-model';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';

@Component({
	selector: 'gj-site-editor-modal',
	template,
})
export class SiteEditorModalComponent
{
	@Input( '<' ) siteId: number;

	@Output( 'close' ) private _close = new EventEmitter<void>();

	site: Site;
	templates: SiteTemplate[] = [];
	currentTemplateId?: number;
	theme: SiteTheme;

	isLoaded = false;
	tab: 'theme' | 'content' = 'theme';

	constructor(
		@Inject( '$sce' ) private $sce: ng.ISCEService,
		@Inject( 'Growls' ) private growls: any,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
	)
	{
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
	}

	get siteUrl()
	{
		return this.$sce.trustAsResourceUrl( this.site.url );
	}

	themeEdited( $theme: any )
	{
		this.theme.data = $theme;
	}

	save()
	{
		const data = {
			template_id: this.currentTemplateId,
			theme: this.theme.data,
			content_blocks: this.site.content_blocks,
		};

		Api.sendRequest( `/web/dash/sites/editor-save/${this.siteId}`, data, { sanitizeComplexData: false } )
			.then( ( _response: any ) =>
			{
				this.growls.success(
					this.gettextCatalog.getString( 'Your site has been saved.' ),
					this.gettextCatalog.getString( 'Site Saved' ),
				);
			} );
	}

	// TODO: If changes, make sure they want to.
	close()
	{
		this._close.emit( undefined );
	}
}
