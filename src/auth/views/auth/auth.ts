import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Auth } from '../../../_common/auth/auth.service';
import { Connection } from '../../../_common/connection/connection-service';
import { Environment } from '../../../_common/environment/environment.service';
import { BaseRouteComponent } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import { AppThemeSvg } from '../../../_common/theme/svg/svg';
import AppTranslateLangSelector from '../../../_common/translate/lang-selector/lang-selector.vue';
import AppCoverImg from '../../components/cover-img/cover-img.vue';
import AppGameCoverCredits from '../../components/game-cover-credits/game-cover-credits.vue';
import { store, Store } from '../../store/index';
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
		AppGameCoverCredits,
	},
	async beforeRouteEnter(_to, _from, next) {
		await store.dispatch('bootstrap');
		next();
	},
})
export default class RouteAuth extends BaseRouteComponent {
	@State shouldShowCoverImage!: Store['shouldShowCoverImage'];
	@State coverMediaItem: Store['coverMediaItem'];
	@State coverGame: Store['coverGame'];

	readonly Environment = Environment;
	readonly Connection = Connection;
	readonly Screen = Screen;
}
