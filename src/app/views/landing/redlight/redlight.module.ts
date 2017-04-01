import { NgModule } from 'ng-metadata/core';
import { RouteRedlightComponent } from './redlight.component';
import { lazyBundle } from '../../../../lib/gj-lib-client/utils/angular-facade';

@NgModule({
	declarations: [
		RouteRedlightComponent
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteRedlightComponent;
