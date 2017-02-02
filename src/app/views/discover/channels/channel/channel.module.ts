import { NgModule } from 'ng-metadata/core';
import { RouteChannelComponent } from './channel.component';
import { lazyBundle } from '../../../../../lib/gj-lib-client/utils/angular-facade';

@NgModule({
	declarations: [
		RouteChannelComponent
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteChannelComponent;
