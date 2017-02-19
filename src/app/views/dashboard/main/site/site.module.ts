import { NgModule } from 'ng-metadata/core';
import { RouteSiteComponent } from './site.component';
import { lazyBundle } from '../../../../../lib/gj-lib-client/utils/angular-facade';
import { SitesLinkCardModule } from '../../../../components/sites/link-card/link-card.module';
import { SitesManagePageModule } from '../../../../components/sites/manage-page/manage-page.module';

@NgModule({
	imports : [
		SitesLinkCardModule,
		SitesManagePageModule,
	],
	declarations: [
		RouteSiteComponent
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteSiteComponent;
