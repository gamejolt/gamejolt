import { Route } from 'vue-router';
import { Component } from 'vue-property-decorator';
import View from '!view!./intent.html';

import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../lib/gj-lib-client/components/route/route-component';
import { PayloadError } from '../../../lib/gj-lib-client/components/payload/payload-service';

const ActionUnsubscribeNotification = 'unsubscribe-notification';
const ActionUnsubscribeGJ = 'unsubscribe-gj';
const ValidActions = [ActionUnsubscribeNotification, ActionUnsubscribeGJ];

@View
@Component({
	name: 'RouteIntent',
})
export default class RouteIntent extends BaseRouteComponent {
	@RouteResolve()
	async routeResolve(this: undefined, route: Route) {
		if (ValidActions.indexOf(route.params.action) === -1) {
			return PayloadError.fromHttpError(404);
		}
	}

	get action() {
		return this.$route.params.action;
	}

	get unsubscribedNotification() {
		return this.action === ActionUnsubscribeNotification;
	}

	get unsubscribedGJ() {
		return this.action === ActionUnsubscribeGJ;
	}
}
