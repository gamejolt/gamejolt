import View from '!view!./flow.html?style=./flow.styl';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Connection } from 'game-jolt-frontend-lib/components/connection/connection-service';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { BaseRouteComponent } from '../../../lib/gj-lib-client/components/route/route-component';
import { AppThemeSvg } from '../../../lib/gj-lib-client/components/theme/svg/svg';
import { AppTranslateLangSelector } from '../../../lib/gj-lib-client/components/translate/lang-selector/lang-selector';
import { AppLoading } from '../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppMutation, AppStore } from '../../../lib/gj-lib-client/vue/services/app/app-store';
import { Store } from '../../store/index';

@View
@Component({
	name: 'RouteFlow',
	components: {
		AppThemeSvg,
		AppTranslateLangSelector,
		AppLoading,
	},
})
export default class RouteFlow extends BaseRouteComponent {
	readonly Environment = Environment;
	readonly Connection = Connection;

	@State
	app!: Store['app'];
	@AppMutation
	setUser!: AppStore['setUser'];

	get isUserBootstrapped() {
		return !!this.app.user;
	}

	async mounted() {
		// Load in user
		const $payload = await Api.sendRequest('/web/new-user/touch-user', null, {});
		if ($payload.user) {
			this.setUser(new User($payload.user));
		}

		// If no user is logged in or they have already completed the signup flow, redirect
		if (!(this.app.user instanceof User)) {
			this.$router.push({ name: 'auth.login' });
		} else {
			// TODO: redirect to the dashboard
			console.log('completed flow', this.app.user.completed_signup_flow);
		}
	}
}
