import { NgModule } from 'ng-metadata/core';
import { lazyBundle } from '../../../../lib/gj-lib-client/utils/angular-facade';
import { RouteBundleComponent } from './bundle.component';

@NgModule({
	declarations: [
		RouteBundleComponent
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteBundleComponent;
