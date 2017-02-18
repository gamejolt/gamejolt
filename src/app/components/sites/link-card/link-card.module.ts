import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../../../lib/gj-lib-client/vue/angular-link';
import { AppSitesLinkCard } from './link-card';

@NgModule({
	declarations: [
		makeComponentProvider( AppSitesLinkCard ),
	],
})
export class SitesLinkCardModule { }
