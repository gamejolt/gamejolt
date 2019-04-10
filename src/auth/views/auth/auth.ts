import { Auth } from 'game-jolt-frontend-lib/components/auth/auth.service';
import { Connection } from 'game-jolt-frontend-lib/components/connection/connection-service';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { MediaItem } from 'game-jolt-frontend-lib/components/media-item/media-item-model';
import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { AppThemeSvg } from 'game-jolt-frontend-lib/components/theme/svg/svg';
import AppTranslateLangSelector from 'game-jolt-frontend-lib/components/translate/lang-selector/lang-selector.vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppCoverImg from '../../components/cover-img/cover-img.vue';
import { store } from '../../store/index';
import './auth-content.styl';

export function loggedUserBlock() {
	// Redirect right away if they are logged in.
	if (store.state.app.user) {
		Auth.redirectDashboard();

		// Never resolve.
		return new Promise(() => {});
	}
}

@Component({
	name: 'RouteAuth',
	components: {
		AppCoverImg,
		AppTranslateLangSelector,
		AppThemeSvg,
	},
	async beforeRouteEnter(_to, _from, next) {
		await store.dispatch('bootstrap');
		next();
	},
})
export default class RouteAuth extends BaseRouteComponent {
	@State shouldShowCoverImage!: boolean;
	@State coverMediaItem?: MediaItem;

	readonly Environment = Environment;
	readonly Connection = Connection;
}
