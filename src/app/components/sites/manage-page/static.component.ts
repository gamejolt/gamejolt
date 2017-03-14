import { Component, Inject, Input } from 'ng-metadata/core';
import * as template from '!html-loader!./static.component.html';

import { Site } from '../../../../lib/gj-lib-client/components/site/site-model';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';

@Component({
	selector: 'gj-sites-manage-page-static',
	template,
})
export class SitesManagePageStaticComponent
{
	@Input() site: Site;
	@Input() enabled: boolean;
	@Input() templateEnabled: boolean;

	constructor(
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
	)
	{
	}

	onBuildAdded( response: any )
	{
		// Only alert if they had a build previously and uploaded a new one.
		if ( this.site.build ) {
			Growls.success(
				this.gettextCatalog.getString( `Your new site build is now active.` ),
				this.gettextCatalog.getString( `Site Updated` ),
			);
		}

		this.site.assign( response.site );
	}

	async activateBuild()
	{
		if ( !this.site || !this.site.build ) {
			return;
		}

		const response = await Api.sendRequest( `/web/dash/sites/activate-primary-build/${this.site.id}`, {} );
		this.site.assign( response.site );
	}
}
