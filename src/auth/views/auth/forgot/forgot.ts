import { Component } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
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
