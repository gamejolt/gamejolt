import { NgModule } from 'ng-metadata/core';
import { RoutePartnersComponent } from './partners.component';
import { lazyBundle } from '../../../../lib/gj-lib-client/utils/angular-facade';

@NgModule({
	declarations: [
		RoutePartnersComponent
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RoutePartnersComponent;
