import { NgModule } from 'ng-metadata/core';
import { lazyBundle } from '../../../lib/gj-lib-client/utils/angular-facade';
import { RouteKeyComponent } from './key.component';

@NgModule({
	declarations: [
		RouteKeyComponent
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteKeyComponent;
