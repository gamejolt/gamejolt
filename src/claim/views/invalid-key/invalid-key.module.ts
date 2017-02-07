import { NgModule } from 'ng-metadata/core';
import { lazyBundle } from '../../../lib/gj-lib-client/utils/angular-facade';
import { RouteInvalidKeyComponent } from './invalid-key.component';

@NgModule({
	declarations: [
		RouteInvalidKeyComponent
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteInvalidKeyComponent;
