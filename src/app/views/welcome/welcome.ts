import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import AppEditableOverlay from 'game-jolt-frontend-lib/components/editable-overlay/editable-overlay.vue';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppThemeSvg } from 'game-jolt-frontend-lib/components/theme/svg/svg';
import AppUserAvatar from 'game-jolt-frontend-lib/components/user/user-avatar/user-avatar.vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../store/index';

@Component({
	name: 'RouteWelcome',
	components: {
		AppUserAvatar,
		AppEditableOverlay,
		AppThemeSvg,
	},
})
@RouteResolver({
	resolver: () => Api.sendRequest('/web/touch'),
})
export default class RouteWelcome extends BaseRouteComponent {
	@State
	app!: Store['app'];

	get routeTitle() {
		return this.$gettext('Welcome to Game Jolt!');
	}

	private get logoScale() {
		return Screen.isXs ? 0.5 : 1;
	}

	get logoWidth() {
		return 328 * this.logoScale;
	}

	get logoHeight() {
		return 36 * this.logoScale;
	}

	get isSkip() {
		return false;
	}

	showEditAvatar() {}

	onNext() {}
}
