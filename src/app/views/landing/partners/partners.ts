import { Component } from 'vue-property-decorator';
import * as View from '!view!./partners.html';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteLandingPartners',
})
export default class RouteLandingPartners extends BaseRouteComponent {}
