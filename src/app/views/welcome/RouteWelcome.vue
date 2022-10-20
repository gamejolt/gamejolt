<script lang="ts">
export default {
	...defineAppRouteOptions({
		resolver: () => Api.sendRequest('/web/onboarding'),
	}),
};
</script>

<script lang="ts" setup>
import { ComponentPublicInstance, computed, markRaw, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Api } from '../../../_common/api/api.service';
import {
	configOnboardingResources,
	configSkipOnboardingProfile,
} from '../../../_common/config/config.service';
import AppFormButton from '../../../_common/form-vue/AppFormButton.vue';
import Onboarding from '../../../_common/onboarding/onboarding.service';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import AppScrollAffix from '../../../_common/scroll/AppScrollAffix.vue';
import { useCommonStore } from '../../../_common/store/common-store';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../_common/translate/translate.service';
import { showUserInviteFollowGrowl } from '../../../_common/user/invite/modal/modal.service';
import { User } from '../../../_common/user/user.model';
import FormOnboardingCreators from '../../components/forms/onboarding/FormOnboardingCreators.vue';
import FormOnboardingFollows from '../../components/forms/onboarding/FormOnboardingFollows.vue';
import FormOnboardingProfile from '../../components/forms/onboarding/FormOnboardingProfile.vue';
import FormOnboardingRealms from '../../components/forms/onboarding/FormOnboardingRealms.vue';

const { user } = useCommonStore();
const router = useRouter();

const steps = computed(() => {
	const result: ComponentPublicInstance<any>[] = configSkipOnboardingProfile.value
		? []
		: [markRaw(FormOnboardingProfile)];

	switch (configOnboardingResources.value) {
		case 'communities':
			result.push(markRaw(FormOnboardingFollows));
			break;

		case 'creators':
			result.push(markRaw(FormOnboardingCreators));
			break;

		case 'realms':
			result.push(markRaw(FormOnboardingRealms));
			break;
	}

	return result;
});

const currentStep = ref(0);
const isSocialRegistration = ref(false);
const inviteUser = ref<User>();

const stepComponent = computed(() => {
	const items = steps.value;
	const step = Math.max(0, Math.min(items.length - 1, currentStep.value));
	return items[step];
});

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
	if (currentStep.value === steps.value.length - 1) {
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
				<AppScrollAffix class="-controls" anchor="bottom" :padding="8">
					<section>
						<template v-if="shouldShowSkip">
							<AppFormButton
								class="-skip"
								block
								:primary="false"
								:solid="false"
								overlay
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
				</AppScrollAffix>
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
