import { NgModule } from 'ng-metadata/core';
import { RouteListComponent } from './list.component';
import { lazyBundle } from '../../../../../lib/gj-lib-client/utils/angular-facade';

@NgModule({
	declarations: [
		RouteListComponent
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteListComponent;
