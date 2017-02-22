import { Component, Inject, Input } from 'ng-metadata/core';
import * as template from '!html-loader!./domain.component.html';

import { Site } from '../../../../lib/gj-lib-client/components/site/site-model';

@Component({
	selector: 'gj-sites-manage-page-domain',
	template,
})
export class SitesManagePageDomainComponent
{
	@Input() site: Site;

	constructor(
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'Growls' ) private Growls: any,
	)
	{
	}

	onDomainSaved()
	{
		this.Growls.success(
			this.gettextCatalog.getString( `Your domain settings have been saved.` ),
			this.gettextCatalog.getString( `Domain Saved` ),
		);
	}
}
