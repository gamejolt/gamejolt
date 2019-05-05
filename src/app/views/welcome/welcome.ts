import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Auth } from 'game-jolt-frontend-lib/components/auth/auth.service';
import AppEditableOverlay from 'game-jolt-frontend-lib/components/editable-overlay/editable-overlay.vue';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { AppThemeSvg } from 'game-jolt-frontend-lib/components/theme/svg/svg';
import AppUserAvatar from 'game-jolt-frontend-lib/components/user/user-avatar/user-avatar.vue';
import { Component } from 'vue-property-decorator';
import { AppState, AppStore } from '../../../lib/gj-lib-client/vue/services/app/app-store';
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

	$refs!: {
		bio: HTMLTextAreaElement;
	};

	selectedAvatar = false;
	inputDisabled = false;

	get routeTitle() {
		return this.$gettext('Welcome to Game Jolt!');
	}

	get hasBio() {
		return !!this.user && !!this.user.description_markdown;
	}

	get isSkip() {
		return !this.selectedAvatar || !this.hasBio;
	}

	routeResolved() {
		if (!this.user) {
			this.$router.push('home');
			return;
		}

		this.selectedAvatar = !!this.user && !!this.user.avatar_media_item;
	}

	async chooseAvatar() {
		await UserAvatarModal.show();
		this.selectedAvatar = true;
	}

	async onNext() {
		if (!this.user) {
			return;
		}

		this.inputDisabled = true;

		if (this.user.description_markdown) {
			await this.user.$save();
		}

		Auth.redirectDashboard();
	}
}
