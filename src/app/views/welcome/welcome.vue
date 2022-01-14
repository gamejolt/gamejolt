<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../_common/api/api.service';
import AppFormButton from '../../../_common/form-vue/AppFormButton.vue';
import Onboarding from '../../../_common/onboarding/onboarding.service';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { useCommonStore } from '../../../_common/store/common-store';
import OnboardingComponent from '../../components/forms/onboarding/base';
import FormOnboardingFollows from '../../components/forms/onboarding/follows/follows.vue';
import FormOnboardingProfile from '../../components/forms/onboarding/profile/profile.vue';

@Options({
	name: 'RouteWelcome',
	components: {
		FormOnboardingProfile,
		AppFormButton,
	},
})
@RouteResolver({
	resolver: () => Api.sendRequest('/web/onboarding'),
})
export default class RouteWelcome extends BaseRouteComponent {
	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	isSocialRegistration = false;

	currentStep = 0;
	steps: (new () => OnboardingComponent)[] = [FormOnboardingProfile, FormOnboardingFollows];

	get routeTitle() {
		return this.$gettext('Welcome to Game Jolt!');
	}

	get stepComponent() {
		return this.steps[this.currentStep];
	}

	routeCreated() {
		Onboarding.start();

		if (!Onboarding.isOnboarding) {
			this.$router.push({ name: 'home' });
			return;
		}
	}

	routeResolved(payload: any) {
		if (!this.user) {
			this.$router.push({ name: 'home' });
			return;
		}

		this.isSocialRegistration = payload.isSocialRegistration;
	}

	onNextStep() {
		if (this.currentStep === this.steps.length - 1) {
			Onboarding.end();
			this.$router.push({ name: 'home' });
			return;
		}

		this.currentStep++;
	}
}
</script>

<template>
	<div class="-welcome fill-darkest">
		<!-- steepper would go here -->

		<component
			:is="stepComponent"
			:user="user"
			:is-social-registration="isSocialRegistration"
			@next="onNextStep"
		>
			<template #controls="{ shouldShowSkip, canContinue }">
				<section class="-controls">
					<template v-if="shouldShowSkip">
						<app-form-button
							class="-skip"
							block
							:primary="false"
							:solid="false"
							trans
							:disabled="!canContinue"
						>
							<translate>Skip</translate>
						</app-form-button>
					</template>
					<template v-else>
						<app-form-button primary block solid :disabled="!canContinue">
							<translate>Next</translate>
						</app-form-button>
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
