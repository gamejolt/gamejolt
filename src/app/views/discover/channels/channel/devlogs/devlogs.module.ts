import { NgModule } from 'ng-metadata/core';
import { RouteDevlogsComponent } from './devlogs.component';
import { RouteFetchComponent } from './_fetch.component';
import { lazyBundle } from '../../../../../../lib/gj-lib-client/utils/angular-facade';

@NgModule({
	declarations: [
		RouteDevlogsComponent,
		RouteFetchComponent,
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteDevlogsComponent;
export { RouteFetchComponent as _fetch };
