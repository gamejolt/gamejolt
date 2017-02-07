import { NgModule } from 'ng-metadata/core';
import { lazyBundle } from '../../../../../lib/gj-lib-client/utils/angular-facade';
import { RouteListComponent } from './list.component';
import { RouteFetchComponent } from './_fetch.component';

@NgModule({
	declarations: [
		RouteListComponent,
		RouteFetchComponent,
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteListComponent;
export { RouteFetchComponent as _fetch };
