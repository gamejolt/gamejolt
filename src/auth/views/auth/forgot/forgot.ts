import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import FormRetrieveLogin from '../../../components/forms/retrieve-login/retrieve-login.vue';


@Component({
	name: 'RouteAuthForgot',
	components: {
		FormRetrieveLogin,
	},
})
export default class RouteAuthForgot extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('auth.forgot.page_title');
	}

	onSubmitted() {
		this.$router.push({ name: 'auth.forgot-sent' });
	}
}
