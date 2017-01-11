import { Component, Output, Inject, Input } from 'ng-metadata/core';
import template from 'html!./site-editor-modal.html';

import { SiteTheme } from '../../../lib/gj-lib-client/components/site/theme/theme-model';
import { Site } from '../../../lib/gj-lib-client/components/site/site-model';
import { SiteTemplate } from '../../../lib/gj-lib-client/components/site/template/template-model';

@Component({
	selector: 'gj-site-editor-modal',
	template,
})
export class SiteEditorModalComponent
{
	@Input( '<' ) siteId: number;

	@Output( 'close' ) _close: Function;

	site: Site;
	templates: SiteTemplate[] = [];
	currentTemplateId?: number;
	theme: SiteTheme;

	isLoaded = false;
	tab: 'theme' | 'content' = 'theme';

	constructor(
		@Inject( '$sce' ) private $sce: ng.ISCEService,
		@Inject( 'Api' ) private api: any,
		@Inject( 'Site' ) private siteModel: typeof Site,
		@Inject( 'SiteTemplate' ) private templateModel: typeof SiteTemplate,
		@Inject( 'Growls' ) private growls: any,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
	)
	{
		this.api.sendRequest( `/web/dash/sites/editor/${this.siteId}` )
			.then( ( response: any ) =>
			{
				this.isLoaded = true;
				this.site = new this.siteModel( response.site );
				this.templates = this.templateModel.populate( response.templates );

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

		this.api.sendRequest( `/web/dash/sites/editor-save/${this.siteId}`, data, { sanitizeComplexData: false } )
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
		this._close();
	}
}
