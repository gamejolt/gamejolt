import { Component } from 'vue-property-decorator';
import * as View from '!view!./forgot-sent.html';

import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteAuthForgotSent',
})
export default class RouteAuthForgotSent extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('auth.forgot.sent.page_title');
	}
}
