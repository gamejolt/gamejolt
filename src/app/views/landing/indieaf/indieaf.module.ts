import { NgModule } from 'ng-metadata/core';
import { RouteIndieafComponent } from './indieaf.component';
import { lazyBundle } from '../../../../lib/gj-lib-client/utils/angular-facade';

@NgModule({
	declarations: [
		RouteIndieafComponent
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteIndieafComponent;
