import { NgModule } from 'ng-metadata/core';
import { SitesManagePageComponent } from './manage-page.component';
import { SitesManagePageStaticComponent } from './static.component';
import { SitesManagePageTemplateComponent } from './template.component';
import { SitesManagePageDomainComponent } from './domain.component';

import SiteBuild from '../../forms/dashboard/site/build/build';
import SiteSettings from '../../forms/dashboard/site/settings/settings';
import SiteDomain from '../../forms/dashboard/site/domain/domain';

@NgModule({
	imports: [
		SiteBuild,
		SiteSettings,
		SiteDomain,
	],
	declarations: [
		SitesManagePageComponent,
		SitesManagePageStaticComponent,
		SitesManagePageTemplateComponent,
		SitesManagePageDomainComponent,
	],
})
export class SitesManagePageModule { }
