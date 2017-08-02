import { Component } from 'vue-property-decorator';
import * as View from '!view!./forgot-sent.html';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteAuthForgotSent',
})
export default class RouteAuthForgotSent extends BaseRouteComponent {
	routeInit() {
		Meta.title = this.$gettext('auth.forgot.sent.page_title');
	}
}
