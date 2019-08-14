import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Auth } from '../../../_common/auth/auth.service';
import { Connection } from '../../../_common/connection/connection-service';
import { Environment } from '../../../_common/environment/environment.service';
import { MediaItem } from '../../../_common/media-item/media-item-model';
import { BaseRouteComponent } from '../../../_common/route/route-component';
import { AppThemeSvg } from '../../../_common/theme/svg/svg';
import AppTranslateLangSelector from '../../../_common/translate/lang-selector/lang-selector.vue';
import { store } from '../../store/index';
import AppCoverImg from '../cover-img/cover-img.vue';
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
