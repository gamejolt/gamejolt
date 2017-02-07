import { NgModule } from 'ng-metadata/core';
import { lazyBundle } from '../../../lib/gj-lib-client/utils/angular-facade';
import { RouteSentKeyComponent } from './sent-key.component';

@NgModule({
	declarations: [
		RouteSentKeyComponent
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteSentKeyComponent;
