import { NgModule } from 'ng-metadata/core';
import { lazyBundle } from '../../../lib/gj-lib-client/utils/angular-facade';
import { RouteRetrieveComponent } from './retrieve.component';

@NgModule({
	declarations: [
		RouteRetrieveComponent
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteRetrieveComponent;
