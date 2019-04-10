import { PayloadError } from 'game-jolt-frontend-lib/components/payload/payload-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';

const ActionUnsubscribeNotification = 'unsubscribe-notification';
const ActionUnsubscribeGJ = 'unsubscribe-gj';
const ValidActions = [ActionUnsubscribeNotification, ActionUnsubscribeGJ];

@Component({
	name: 'RouteIntent',
})
@RouteResolver({
	async resolver({ route }) {
		if (ValidActions.indexOf(route.params.action) === -1) {
			return PayloadError.fromHttpError(404);
		}
	},
})
export default class RouteIntent extends BaseRouteComponent {
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
