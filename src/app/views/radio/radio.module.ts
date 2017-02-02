import { NgModule } from 'ng-metadata/core';
import { lazyBundle } from '../../../lib/gj-lib-client/utils/angular-facade';
import { RouteRadioComponent } from './radio.component';

@NgModule({
	declarations: [
		RouteRadioComponent
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteRadioComponent;
