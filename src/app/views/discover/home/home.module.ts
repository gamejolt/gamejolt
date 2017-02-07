import { NgModule } from 'ng-metadata/core';
import { RouteHomeComponent } from './home.component';
import { lazyBundle } from '../../../../lib/gj-lib-client/utils/angular-facade';

// Components just for this page.
import { FeaturedComponent } from '../../../components/discover/home/featured/featured-directive';
import { HeroComponent } from '../../../components/discover/home/featured/hero-directive';

@NgModule({
	declarations: [
		RouteHomeComponent,
		FeaturedComponent,
		HeroComponent,
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteHomeComponent;
