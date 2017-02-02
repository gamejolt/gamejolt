import { NgModule } from 'ng-metadata/core';
import { lazyBundle } from '../../../../../../lib/gj-lib-client/utils/angular-facade';
import { RouteManageComponent } from './manage.component';

import Devlog from './devlog/devlog';
import Site from './site/site';

@NgModule({
	imports: [
		Devlog,
		Site,
	],
	declarations: [
		RouteManageComponent,
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteManageComponent;
