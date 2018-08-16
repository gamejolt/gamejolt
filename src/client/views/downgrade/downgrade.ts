import View from '!view!./downgrade.html';
import { Component } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDowngrade',
})
export default class RouteDowngrade extends BaseRouteComponent {}
