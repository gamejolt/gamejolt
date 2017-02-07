import { NgModule } from 'ng-metadata/core';
import { lazyBundle } from '../../../../lib/gj-lib-client/utils/angular-facade';
import { RouteAboutComponent } from './about.component';

@NgModule({
	declarations: [
		RouteAboutComponent
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteAboutComponent;
