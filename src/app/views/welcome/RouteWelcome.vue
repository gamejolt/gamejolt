<script lang="ts">
import { computed, markRaw, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Api } from '../../../_common/api/api.service';
import AppFormButton from '../../../_common/form-vue/AppFormButton.vue';
import Onboarding from '../../../_common/onboarding/onboarding.service';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { useCommonStore } from '../../../_common/store/common-store';
import { $gettext } from '../../../_common/translate/translate.service';
import FormOnboardingFollows from '../../components/forms/onboarding/FormOnboardingFollows.vue';
import FormOnboardingProfile from '../../components/forms/onboarding/FormOnboardingProfile.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { User } from '../../../_common/user/user.model';
import { showUserInviteFollowGrowl } from '../../../_common/user/invite/modal/modal.service';

export default {
	...defineAppRouteOptions({
		resolver: () => Api.sendRequest('/web/onboarding'),
	}),
};
</script>

<script lang="ts" setup>
const { user } = useCommonStore();
const router = useRouter();

const steps = [markRaw(FormOnboardingProfile), markRaw(FormOnboardingFollows)];

const currentStep = ref(0);
const isSocialRegistration = ref(false);
const inviteUser = ref<User>();

const stepComponent = computed(() => steps[currentStep.value]);

createAppRoute({
	routeTitle: computed(() => $gettext(`Welcome to Game Jolt!`)),
	onInit() {
		Onboarding.start();
	},
	onResolved({ payload }) {
		if (!user.value) {
			router.push({ name: 'home' });
			return;
		}

		isSocialRegistration.value = payload.isSocialRegistration || false;
		inviteUser.value = payload.inviteUser && new User(payload.inviteUser);
	},
});

function onNextStep() {
	if (currentStep.value === steps.length - 1) {
		Onboarding.end();

		if (inviteUser.value) {
			showUserInviteFollowGrowl(inviteUser.value);
		}

		router.push({ name: 'home' });
		return;
	}

	currentStep.value++;
}
</script>

<template>
	<div class="-welcome fill-darkest">
		<component
			:is="stepComponent"
			:user="user"
			:is-social-registration="isSocialRegistration"
			@next="onNextStep"
		>
			<template #controls="{ shouldShowSkip, canContinue }">
				<section class="-controls">
					<template v-if="shouldShowSkip">
						<AppFormButton
							class="-skip"
							block
							:primary="false"
							:solid="false"
							trans
							:disabled="!canContinue"
						>
							<AppTranslate>Skip</AppTranslate>
						</AppFormButton>
					</template>
					<template v-else>
						<AppFormButton primary block solid :disabled="!canContinue">
							<AppTranslate>Next</AppTranslate>
						</AppFormButton>
					</template>
				</section>
			</template>
		</component>
	</div>
</template>

<style lang="stylus" scoped>
.-welcome
	change-bg('darkest')
	min-height: 100vh

.-controls
	margin-top: 30px

.-skip
	theme-prop('color', 'fg-muted')
</style>
