import { NgModule } from 'ng-metadata/core';
import { RouteGameApiComponent } from './game-api.component';
import { lazyBundle } from '../../../../lib/gj-lib-client/utils/angular-facade';

@NgModule({
	declarations: [
		RouteGameApiComponent
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteGameApiComponent;
