import { NgModule } from 'ng-metadata/core';
import { lazyBundle } from '../../../../lib/gj-lib-client/utils/angular-facade';
import { RouteMarketplaceComponent } from './marketplace.component';

@NgModule({
	declarations: [
		RouteMarketplaceComponent
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteMarketplaceComponent;
