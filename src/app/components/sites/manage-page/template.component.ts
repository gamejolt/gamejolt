import { Component, Input, Inject } from 'ng-metadata/core';
import * as template from '!html-loader!./template.component.html';

import { Site } from '../../../../lib/gj-lib-client/components/site/site-model';
import { SiteEditorModal } from '../../site-editor-modal/site-editor-modal.service';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';

@Component({
	selector: 'gj-sites-manage-page-template',
	template,
})
export class SitesManagePageTemplateComponent
{
	@Input() site: Site;
	@Input() enabled: boolean;
	@Input() staticEnabled: boolean;

	constructor(
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'SiteEditorModal' ) private editorModal: SiteEditorModal,
	)
	{
	}

	enable()
	{
		return this.site.$activate();
	}

	showEditor( tab: 'theme' | 'content' )
	{
		if ( this.site ) {
			this.editorModal.show( this.site.id, tab );
		}
	}

	onSettingsSaved()
	{
		Growls.success(
			this.gettextCatalog.getString( `Your site settings have been saved.` ),
			this.gettextCatalog.getString( `Settings Saved` ),
		);
	}
}
