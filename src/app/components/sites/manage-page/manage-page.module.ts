import { NgModule } from 'ng-metadata/core';
import { SitesManagePageComponent } from './manage-page.component';
import { SitesManagePageStaticComponent } from './static.component';
import { SitesManagePageTemplateComponent } from './template.component';

@NgModule({
	declarations: [
		SitesManagePageComponent,
		SitesManagePageStaticComponent,
		SitesManagePageTemplateComponent,
	],
})
export class SitesManagePageModule { }
