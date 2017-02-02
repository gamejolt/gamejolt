import { NgModule } from 'ng-metadata/core';
import { RouteOverviewComponent } from './overview.component';
import { lazyBundle } from '../../../../../../lib/gj-lib-client/utils/angular-facade';

@NgModule({
	declarations: [
		RouteOverviewComponent
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteOverviewComponent;
