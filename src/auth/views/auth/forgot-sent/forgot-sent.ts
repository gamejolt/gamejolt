import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';


@Component({
	name: 'RouteAuthForgotSent',
})
export default class RouteAuthForgotSent extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('auth.forgot.sent.page_title');
	}
}
