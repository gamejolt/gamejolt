import AppEditableOverlay from 'game-jolt-frontend-lib/components/editable-overlay/editable-overlay.vue';
import { FormOnLoad, FormOnSubmit } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import Onboarding, {
	OnboardingStep,
} from 'game-jolt-frontend-lib/components/onboarding/onboarding.service';
import { AppThemeSvg } from 'game-jolt-frontend-lib/components/theme/svg/svg';
import AppUserAvatar from 'game-jolt-frontend-lib/components/user/user-avatar/user-avatar.vue';
import { Component } from 'vue-property-decorator';
import { UserAvatarModal } from '../../../user/avatar-modal/avatar-modal.service';
import OnboardingComponent from '../base';

export type FormModel = {
	username: string;
	bio: string;
};

@Component({
	components: {
		AppUserAvatar,
		AppEditableOverlay,
		AppThemeSvg,
	},
})
export default class FormOnboardingProfile extends OnboardingComponent<FormModel>
	implements FormOnLoad, FormOnSubmit {
	stepName = 'profile' as OnboardingStep;

	originalUsername = '';
	allowUsernameChange = false;

	originalBio = '';
	allowBioChange = false;

	bootstrappedAvatar = false;
	hasSelectedAvatar = false;

	get loadUrl() {
		return '/web/onboarding/profile';
	}

	get showUsername() {
		return this.isSocialRegistration && this.allowUsernameChange;
	}

	get hasBio() {
		return this.formModel.bio.length > 0;
	}

	get hasModifiedBio() {
		return this.originalBio !== this.formModel.bio;
	}

	get hasAvatar() {
		return !!this.user.avatar_media_item;
	}

	get shouldShowSkip() {
		return (
			(!this.hasAvatar && !this.hasSelectedAvatar) || (!this.hasBio && !this.hasModifiedBio)
		);
	}

	created() {
		super.created();

		this.bootstrappedAvatar = !!this.user && !!this.user.avatar_media_item;
		if (this.bootstrappedAvatar) {
			Onboarding.trackEvent('avatar-bootstrap');
		}

		this.originalUsername = this.user.username;
		this.setField('username', this.originalUsername);

		this.originalBio = (this.user.description_markdown || '').trim();
		this.setField('bio', this.originalBio);
		if (this.hasBio) {
			Onboarding.trackEvent('bio-bootstrap');
		}
	}

	onLoad(payload: any) {
		this.allowUsernameChange = payload.allowUsernameChange;
		this.allowBioChange = payload.allowBioChange;
	}

	async chooseAvatar() {
		if (!this.hasSelectedAvatar) {
			if (this.bootstrappedAvatar) {
				Onboarding.trackEvent('avatar-change');
			} else {
				Onboarding.trackEvent('avatar-set');
			}
		}
		this.hasSelectedAvatar = true;

		await UserAvatarModal.show();
	}

	onSubmit() {
		// If the user did not change their avatar (or bio) it means they either accepted
		// the bootstrapped value for them or just skipped setting it altogether. Log the appropriate event.
		if (!this.hasSelectedAvatar) {
			Onboarding.trackEvent(this.bootstrappedAvatar ? 'avatar-accept' : 'avatar-skip');
		}

		if (this.isSocialRegistration) {
			const usernameChanged = this.originalUsername !== this.formModel.username;
			Onboarding.trackEvent(usernameChanged ? 'username-change' : 'username-accept');

			this.user.username = this.formModel.username;
			this.user.name = this.formModel.username;
		}

		if (this.originalBio.length > 0) {
			Onboarding.trackEvent(this.hasModifiedBio ? 'bio-change' : 'bio-accept');
		} else {
			Onboarding.trackEvent(this.hasModifiedBio ? 'bio-set' : 'bio-skip');
		}
		this.user.description_markdown = this.formModel.bio;

		return this.user.$save();
	}
}
