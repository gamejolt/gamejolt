<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import { ContentDocument } from '../../../../../_common/content/content-document';
import AppEditableOverlay from '../../../../../_common/editable-overlay/editable-overlay.vue';
import AppFormControlContent from '../../../../../_common/form-vue/controls/AppFormControlContent.vue';
import { FormOnLoad, FormOnSubmit } from '../../../../../_common/form-vue/form.service';
import { validateUsername } from '../../../../../_common/form-vue/validators';
import Onboarding, { OnboardingStep } from '../../../../../_common/onboarding/onboarding.service';
import AppThemeSvg from '../../../../../_common/theme/svg/AppThemeSvg.vue';
import AppUserAvatar from '../../../../../_common/user/user-avatar/user-avatar.vue';
import { UserAvatarModal } from '../../../user/avatar-modal/avatar-modal.service';
import OnboardingComponent from '../base';

export type FormModel = {
	username: string;
	bio: string;
};

@Options({
	components: {
		AppUserAvatar,
		AppEditableOverlay,
		AppThemeSvg,
		AppFormControlContent,
	},
})
export default class FormOnboardingProfile
	extends mixins(OnboardingComponent)
	implements FormOnLoad, FormOnSubmit
{
	stepName = 'profile' as OnboardingStep;

	originalUsername = '';
	allowUsernameChange = false;

	originalBio = '';
	allowBioChange = false;

	bootstrappedAvatar = false;
	hasSelectedAvatar = false;

	readonly validateUsername = validateUsername;

	get loadUrl() {
		return '/web/onboarding/profile';
	}

	get showUsername() {
		return this.isSocialRegistration && this.allowUsernameChange;
	}

	get hasBio() {
		const doc = ContentDocument.fromJson(this.formModel.bio);
		return doc.hasContent;
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

		const emptyBio = new ContentDocument('user-bio').toJson();
		this.originalBio = this.user.bio_content || emptyBio;
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

		const doc = ContentDocument.fromJson(this.originalBio);
		if (doc.hasContent) {
			Onboarding.trackEvent(this.hasModifiedBio ? 'bio-change' : 'bio-accept');
		} else {
			Onboarding.trackEvent(this.hasModifiedBio ? 'bio-set' : 'bio-skip');
		}
		this.user.bio_content = this.formModel.bio;

		return this.user.$save();
	}
}
</script>

<template>
	<app-form :controller="form">
		<div class="-form">
			<section class="-message">
				<h3 class="section-header">
					<translate>Let's get you set up!</translate>
				</h3>
			</section>

			<section class="-avatar">
				<app-editable-overlay @click="chooseAvatar()">
					<template #overlay>
						<translate>Change</translate>
					</template>
					<app-user-avatar :user="user" />
				</app-editable-overlay>
			</section>

			<app-form-group v-if="showUsername" name="username" hide-label>
				<section class="-username">
					<div class="-field-row">
						<div class="-hello text-muted"><translate>Hello! It'sa me,</translate></div>
						<div class="-field">
							<div class="-at text-muted">@</div>
							<app-form-control
								type="text"
								:validators="[
									validateMinLength(3),
									validateMaxLength(30),
									validateUsername(),
									validateAvailability({
										url: '/web/dash/profile/check-field-availability/username',
										initVal: user.username,
									}),
								]"
								:validate-on="['blur']"
							/>
						</div>
					</div>
					<app-form-control-errors hide-caret />
				</section>
			</app-form-group>

			<section class="-bio">
				<app-form-group name="bio" optional hide-label>
					<app-form-control-content
						v-if="isLoaded"
						class="-bio-input anim-fade-in"
						content-context="user-bio"
						:disabled="!allowBioChange"
						:model-id="user.id"
						:placeholder="$gettext(`Tell people about yourself`)"
						:max-height="0"
					/>
					<div v-else class="-bio-input-placeholder" />
				</app-form-group>
			</section>

			<slot name="controls" :canContinue="canContinue" :shouldShowSkip="shouldShowSkip" />
		</div>
	</app-form>
</template>

<style lang="stylus" src="./profile.styl" scoped></style>
