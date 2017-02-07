import { NgModule } from 'ng-metadata/core';
import { lazyBundle } from '../../../../lib/gj-lib-client/utils/angular-facade';
import { RouteGameComponent } from './game.component';

@NgModule({
	declarations: [
		RouteGameComponent,
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteGameComponent;
