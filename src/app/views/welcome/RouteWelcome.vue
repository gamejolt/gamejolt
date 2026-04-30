<script lang="ts">
import { computed, markRaw, ref } from 'vue';
import { useRouter } from 'vue-router';

import FormOnboardingProfile from '~app/components/forms/onboarding/FormOnboardingProfile.vue';
import FormOnboardingRealms from '~app/components/forms/onboarding/FormOnboardingRealms.vue';
import { Api } from '~common/api/api.service';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import { endOnboarding, startOnboarding } from '~common/onboarding/onboarding.service';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import AppScrollAffix from '~common/scroll/AppScrollAffix.vue';
import { useCommonStore } from '~common/store/common-store';
import { $gettext } from '~common/translate/translate.service';
import { showUserInviteFollowGrowl } from '~common/user/invite/modal/modal.service';
import { UserModel } from '~common/user/user.model';

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
		resolver: () => Api.sendRequest('/web/onboarding'),
	}),
};
</script>

<script lang="ts" setup>
const { user, setInitialPackWatermarkStorageValue } = useCommonStore();
const router = useRouter();

const steps = [markRaw(FormOnboardingProfile), markRaw(FormOnboardingRealms)];

const currentStep = ref(0);
const isSocialRegistration = ref(false);
const inviteUser = ref<UserModel>();

const stepComponent = computed(() => {
	const step = Math.max(0, Math.min(steps.length - 1, currentStep.value));
	return steps[step];
});

createAppRoute({
	routeTitle: computed(() => $gettext(`Welcome to Game Jolt!`)),
	onInit() {
		if (!import.meta.env.SSR) {
			startOnboarding();
		}
	},
	onResolved({ payload }) {
		if (!user.value) {
			router.push({ name: 'home' });
			return;
		}

		isSocialRegistration.value = payload.isSocialRegistration || false;
		inviteUser.value = payload.inviteUser && new UserModel(payload.inviteUser);
		setInitialPackWatermarkStorageValue(true);
	},
});

function onNextStep() {
	if (currentStep.value === steps.length - 1) {
		endOnboarding();

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
			:user="user ?? undefined"
			:is-social-registration="isSocialRegistration"
			@next="onNextStep"
		>
			<template #controls="{ shouldShowSkip, canContinue }">
				<AppScrollAffix class="-controls" anchor="bottom" :padding="8">
					<div class="-controls-outer">
						<div class="-controls-content">
							<template v-if="shouldShowSkip">
								<AppFormButton
									class="-skip"
									:primary="false"
									:solid="false"
									block
									trans
									:disabled="!canContinue"
								>
									{{ $gettext(`Skip`) }}
								</AppFormButton>
							</template>
							<template v-else>
								<AppFormButton primary block solid :disabled="!canContinue">
									{{ $gettext(`Next`) }}
								</AppFormButton>
							</template>
						</div>
					</div>
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
	margin-top: 20px
	// Gotta go over other content on the page.
	z-index: 10

.-controls-content
	rounded-corners()
	padding: 8px
	margin-right: 8px
	background-color: var(--theme-dark)

	:deep(.gj-scroll-affixed) &
		elevate-2()
</style>
