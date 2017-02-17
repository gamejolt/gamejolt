import { NgModule } from 'ng-metadata/core';
import { lazyBundle } from '../../../../../../../lib/gj-lib-client/utils/angular-facade';
import { RouteSiteComponent } from './site.component';

@NgModule({
	declarations: [
		RouteSiteComponent
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteSiteComponent;
