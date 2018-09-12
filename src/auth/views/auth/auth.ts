import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./auth.html?style=./auth.styl';
import './auth-content.styl';

import { store } from '../../store/index';
import { MediaItem } from '../../../lib/gj-lib-client/components/media-item/media-item-model';
import { AppCoverImg } from '../../components/cover-img/cover-img';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { Connection } from '../../../lib/gj-lib-client/components/connection/connection-service';
import { AppTranslateLangSelector } from '../../../lib/gj-lib-client/components/translate/lang-selector/lang-selector';
import { Auth } from '../../../lib/gj-lib-client/components/auth/auth.service';
import { BaseRouteComponent } from '../../../lib/gj-lib-client/components/route/route-component';
import { AppThemeSvg } from '../../../lib/gj-lib-client/components/theme/svg/svg';

export function loggedUserBlock() {
	// Redirect right away if they are logged in.
	if (store.state.app.user) {
		Auth.redirectDashboard();

		// Never resolve.
		return new Promise(() => {});
	}
}

@View
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
