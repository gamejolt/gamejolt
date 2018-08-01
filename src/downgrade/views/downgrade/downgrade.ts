import { Component } from 'vue-property-decorator';
import View from '!view!./downgrade.html';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { BaseRouteComponent } from '../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDowngrade',
})
export default class RouteDowngrade extends BaseRouteComponent {
	Environment = Environment;
}
