import { NgModule } from 'ng-metadata/core';
import { RouteGamesComponent } from './games.component';
import { lazyBundle } from '../../../../../../lib/gj-lib-client/utils/angular-facade';
import { RouteFetchComponent } from './_fetch.component';

@NgModule({
	declarations: [
		RouteGamesComponent,
		RouteFetchComponent,
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteGamesComponent;
export { RouteFetchComponent as _fetch };
