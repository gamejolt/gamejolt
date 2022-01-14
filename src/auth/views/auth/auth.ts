import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { imageGameJoltLogo } from '../../../app/img/images';
import { redirectToDashboard } from '../../../_common/auth/auth.service';
import { Connection } from '../../../_common/connection/connection-service';
import { Environment } from '../../../_common/environment/environment.service';
import { BaseRouteComponent } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import { commonStore } from '../../../_common/store/common-store';
import AppThemeSvg from '../../../_common/theme/svg/AppThemeSvg.vue';
import AppTranslateLangSelector from '../../../_common/translate/lang-selector/lang-selector.vue';
import AppCoverImg from '../../components/AppCoverImg.vue';
import AppGameCoverCredits from '../../components/game-cover-credits/game-cover-credits.vue';
import { authStore, useAuthStore } from '../../store/index';
import './auth-content.styl';

export function loggedUserBlock() {
	// Redirect right away if they are logged in.
	if (commonStore.user.value) {
		redirectToDashboard();

		// Never resolve.
		return new Promise(() => {});
	}
}

@Options({
	name: 'RouteAuth',
	components: {
		AppCoverImg,
		AppTranslateLangSelector,
		AppThemeSvg,
		AppGameCoverCredits,
	},
	async beforeRouteEnter(_to, _from) {
		await authStore.bootstrap();
	},
})
export default class RouteAuth extends BaseRouteComponent {
	store = setup(() => useAuthStore());

	get shouldShowCoverImage() {
		return this.store.shouldShowCoverImage;
	}

	get coverMediaItem() {
		return this.store.coverMediaItem;
	}

	get coverGame() {
		return this.store.coverGame;
	}

	readonly Environment = Environment;
	readonly Connection = Connection;
	readonly Screen = Screen;
	readonly imageGameJoltLogo = imageGameJoltLogo;
}
