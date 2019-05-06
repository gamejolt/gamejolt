import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Auth } from 'game-jolt-frontend-lib/components/auth/auth.service';
import AppEditableOverlay from 'game-jolt-frontend-lib/components/editable-overlay/editable-overlay.vue';
import Onboarding from 'game-jolt-frontend-lib/components/onboarding/onboarding.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { AppThemeSvg } from 'game-jolt-frontend-lib/components/theme/svg/svg';
import AppUserAvatar from 'game-jolt-frontend-lib/components/user/user-avatar/user-avatar.vue';
import { AppState, AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import { Component } from 'vue-property-decorator';
import { UserAvatarModal } from '../../components/user/avatar-modal/avatar-modal.service';

@Component({
	name: 'RouteWelcome',
	components: {
		AppUserAvatar,
		AppEditableOverlay,
		AppThemeSvg,
	},
})
@RouteResolver({
	resolver: () => Api.sendRequest('/web/touch?onboard=1'),
})
export default class RouteWelcome extends BaseRouteComponent {
	@AppState
	user!: AppStore['user'];

	startedOn = Date.now();
	hasSelectedAvatar = false;
	hasModifiedBio = false;
	isInputDisabled = false;

	get routeTitle() {
		return this.$gettext('Welcome to Game Jolt!');
	}

	get hasBio() {
		return !!this.user && !!this.user.description_markdown;
	}

	get isNext() {
		return this.hasSelectedAvatar && (this.hasBio || this.hasModifiedBio);
	}

	routeCreated() {
		// Since the app section and auth section may run on different ports
		// the local storage key used to start the onboarding flow might not be available.
		// This allows us to test in dev.
		if (GJ_ENVIRONMENT === 'development') {
			Onboarding.start();
		}

		if (!Onboarding.isOnboarding) {
			this.$router.push({ name: 'home' });
			return;
		}
	}

	routeResolved() {
		if (!this.user) {
			this.$router.push({ name: 'home' });
			return;
		}

		Onboarding.startStep('profile');

		this.hasSelectedAvatar = !!this.user && !!this.user.avatar_media_item;
		if (this.hasSelectedAvatar) {
			Onboarding.trackEvent('avatar', 'bootstrap');
		}

		if (this.hasBio) {
			Onboarding.trackEvent('bio', 'bootstrap');
		}
	}

	async chooseAvatar() {
		Onboarding.trackEvent('avatar', 'set');
		await UserAvatarModal.show();
		this.hasSelectedAvatar = true;
	}

	onBioChanged() {
		if (!this.hasModifiedBio) {
			Onboarding.trackEvent('bio', 'set');
		}
		this.hasModifiedBio = true;
	}

	async onNext() {
		if (!this.user) {
			return;
		}

		this.isInputDisabled = true;

		Onboarding.endStep(!this.isNext);

		if (this.hasModifiedBio) {
			await this.user.$save();
		}

		Auth.redirectDashboard();
	}
}
