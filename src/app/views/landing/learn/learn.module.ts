import { NgModule } from 'ng-metadata/core';
import { RouteLearnComponent } from './learn.component';
import { lazyBundle } from '../../../../lib/gj-lib-client/utils/angular-facade';

@NgModule({
	declarations: [
		RouteLearnComponent
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteLearnComponent;
