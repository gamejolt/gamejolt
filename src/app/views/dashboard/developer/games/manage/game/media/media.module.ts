import { NgModule } from 'ng-metadata/core';
import { RouteMediaComponent } from './media.component';
import { lazyBundle } from '../../../../../../../../lib/gj-lib-client/utils/angular-facade';

@NgModule({
	declarations: [
		RouteMediaComponent,
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteMediaComponent;
