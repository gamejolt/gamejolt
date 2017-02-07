import { NgModule } from 'ng-metadata/core';
import { RouteDealComponent } from './deal.component';
import { lazyBundle } from '../../../../lib/gj-lib-client/utils/angular-facade';

@NgModule({
	declarations: [
		RouteDealComponent
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteDealComponent;
