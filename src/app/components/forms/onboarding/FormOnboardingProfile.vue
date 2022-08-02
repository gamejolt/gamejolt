<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import { ContentDocument } from '../../../../_common/content/content-document';
import AppEditableOverlay from '../../../../_common/editable-overlay/AppEditableOverlay.vue';
import { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import AppFormControlContent from '../../../../_common/form-vue/controls/AppFormControlContent.vue';
import {
	validateAvailability,
	validateMaxLength,
	validateMinLength,
	validateUsername,
} from '../../../../_common/form-vue/validators';
import Onboarding from '../../../../_common/onboarding/onboarding.service';
import AppUserAvatar from '../../../../_common/user/user-avatar/user-avatar.vue';
import { User } from '../../../../_common/user/user.model';
import { UserAvatarModal } from '../../user/avatar-modal/avatar-modal.service';
import AppFormControl from '../../../../_common/form-vue/AppFormControl.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppForm from '../../../../_common/form-vue/AppForm.vue';
import AppFormControlErrors from '../../../../_common/form-vue/AppFormControlErrors.vue';

type FormModel = {
	username: string;
	bio: string;
};

const props = defineProps({
	user: {
		type: Object as PropType<User>,
		required: true,
	},
	isSocialRegistration: {
		type: Boolean,
		required: true,
	},
});

const emit = defineEmits({
	next: () => true,
});

const { user, isSocialRegistration } = toRefs(props);

const originalUsername = ref('');
const allowUsernameChange = ref(false);

const originalBio = ref('');
const allowBioChange = ref(false);

const bootstrappedAvatar = ref(false);
const hasSelectedAvatar = ref(false);

const form: FormController<FormModel> = createForm({
	warnOnDiscard: false,
	onInit() {
		Onboarding.startStep('profile');

		bootstrappedAvatar.value = !!user.value && !!user.value.avatar_media_item;
		if (bootstrappedAvatar.value) {
			Onboarding.trackEvent('avatar-bootstrap');
		}

		originalUsername.value = user.value.username;
		form.formModel.username = originalUsername.value;

		const emptyBio = new ContentDocument('user-bio').toJson();
		originalBio.value = user.value.bio_content || emptyBio;
		form.formModel.bio = originalBio.value;
		if (hasBio.value) {
			Onboarding.trackEvent('bio-bootstrap');
		}
	},
	loadUrl: '/web/onboarding/profile',
	onLoad(payload) {
		allowUsernameChange.value = payload.allowUsernameChange || true;
		allowBioChange.value = payload.allowBioChange || true;
	},
	async onSubmit() {
		// If the user did not change their avatar (or bio) it means they either accepted
		// the bootstrapped value for them or just skipped setting it altogether. Log the appropriate event.
		if (!hasSelectedAvatar.value) {
			Onboarding.trackEvent(bootstrappedAvatar.value ? 'avatar-accept' : 'avatar-skip');
		}

		if (isSocialRegistration.value) {
			const usernameChanged = originalUsername.value !== form.formModel.username;
			Onboarding.trackEvent(usernameChanged ? 'username-change' : 'username-accept');
			user.value.username = form.formModel.username;
			user.value.name = form.formModel.username;
		}

		const doc = ContentDocument.fromJson(originalBio.value);
		if (doc.hasContent) {
			Onboarding.trackEvent(hasModifiedBio.value ? 'bio-change' : 'bio-accept');
		} else {
			Onboarding.trackEvent(hasModifiedBio.value ? 'bio-set' : 'bio-skip');
		}
		user.value.bio_content = form.formModel.bio;

		return user.value.$save();
	},
	onSubmitSuccess() {
		Onboarding.endStep(shouldShowSkip.value);
		emit('next');
	},
});

const showUsername = computed(() => isSocialRegistration.value && allowUsernameChange.value);
const hasModifiedBio = computed(() => originalBio.value !== form.formModel.bio);
const hasAvatar = computed(() => !!user.value.avatar_media_item);

const hasBio = computed(() => {
	if (!form.formModel.bio) {
		return false;
	}

	return ContentDocument.fromJson(form.formModel.bio).hasContent;
});

const shouldShowSkip = computed(() => {
	return (
		(!hasAvatar.value && !hasSelectedAvatar.value) || (!hasBio.value && !hasModifiedBio.value)
	);
});

async function chooseAvatar() {
	if (!hasSelectedAvatar.value) {
		if (bootstrappedAvatar.value) {
			Onboarding.trackEvent('avatar-change');
		} else {
			Onboarding.trackEvent('avatar-set');
		}
	}
	hasSelectedAvatar.value = true;

	await UserAvatarModal.show();
}
</script>

<template>
	<AppForm :controller="form">
		<div class="-form">
			<section class="-message">
				<h3 class="section-header">
					<AppTranslate>Let's get you set up!</AppTranslate>
				</h3>
			</section>

			<section class="-avatar">
				<AppEditableOverlay @click="chooseAvatar()">
					<template #overlay>
						<AppTranslate>Change</AppTranslate>
					</template>
					<AppUserAvatar :user="user" />
				</AppEditableOverlay>
			</section>

			<AppFormGroup v-if="showUsername" name="username" hide-label>
				<section class="-username">
					<div class="-field-row">
						<div class="-hello text-muted">
							<AppTranslate>Hello! It'sa me,</AppTranslate>
						</div>
						<div class="-field">
							<div class="-at text-muted">@</div>
							<AppFormControl
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
								validate-on-blur
							/>
						</div>
					</div>
					<AppFormControlErrors hide-caret />
				</section>
			</AppFormGroup>

			<section class="-bio">
				<AppFormGroup name="bio" optional hide-label>
					<AppFormControlContent
						v-if="form.isLoaded"
						class="-bio-input anim-fade-in"
						content-context="user-bio"
						:disabled="!allowBioChange"
						:model-id="user.id"
						:placeholder="$gettext(`Tell people about yourself`)"
						:max-height="0"
					/>
					<div v-else class="-bio-input-placeholder" />
				</AppFormGroup>
			</section>

			<slot name="controls" :can-continue="form.valid" :should-show-skip="shouldShowSkip" />
		</div>
	</AppForm>
</template>

<style lang="stylus" scoped>
.-form
	display: flex
	flex-direction: column
	max-width: 500px
	margin: 0 auto
	padding: ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		padding: $grid-gutter-width

	text-align: center

	> *:not(:first-child)
		margin-top: 30px

.-avatar .editable-overlay
	width: 130px
	height: 130px
	margin: 0 auto
	border-radius: 50%
	border: 4px solid
	theme-prop('border-color', 'bg-subtle')
	overflow: hidden

.-username
	// pull bio higher
	margin-bottom: -15px

	.-field-row
		display: flex
		align-items: center

		.-hello
			margin-right: 10px
			flex: none

		.-field
			text-align: left
			position: relative
			width: 100%
			flex: auto
			display: flex
			align-items: center

			.-at
				position: absolute
				left: 7px

			input
				padding-left: 23px
				display: inline-block

.-bio-input
	text-align: left

	&-placeholder
		min-height: ($line-height-computed + 22)

::v-deep(.form-group)
	margin-bottom: 0

	::v-deep(.error)
		margin-top: 15px
		margin-bottom: 0
</style>
