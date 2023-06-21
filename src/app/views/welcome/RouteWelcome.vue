<script lang="ts">
import { computed, markRaw, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Api } from '../../../_common/api/api.service';
import { configInitialPackWatermark } from '../../../_common/config/config.service';
import AppFormButton from '../../../_common/form-vue/AppFormButton.vue';
import Onboarding from '../../../_common/onboarding/onboarding.service';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import AppScrollAffix from '../../../_common/scroll/AppScrollAffix.vue';
import { useCommonStore } from '../../../_common/store/common-store';
import { $gettext } from '../../../_common/translate/translate.service';
import { showUserInviteFollowGrowl } from '../../../_common/user/invite/modal/modal.service';
import { User } from '../../../_common/user/user.model';
import FormOnboardingProfile from '../../components/forms/onboarding/FormOnboardingProfile.vue';
import FormOnboardingRealms from '../../components/forms/onboarding/FormOnboardingRealms.vue';

export default {
	...defineAppRouteOptions({
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
const inviteUser = ref<User>();

const stepComponent = computed(() => {
	const step = Math.max(0, Math.min(steps.length - 1, currentStep.value));
	return steps[step];
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

		if (configInitialPackWatermark.value) {
			setInitialPackWatermarkStorageValue(true);
		}
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

	::v-deep(.gj-scroll-affixed) &
		elevate-2()
</style>
