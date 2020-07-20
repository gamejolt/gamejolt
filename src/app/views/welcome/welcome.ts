import { Component } from 'vue-property-decorator';
import { Api } from '../../../_common/api/api.service';
import AppFormButton from '../../../_common/form-vue/button/button.vue';
import Onboarding from '../../../_common/onboarding/onboarding.service';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { AppState, AppStore } from '../../../_common/store/app-store';
import OnboardingComponent from '../../components/forms/onboarding/base';
import FormOnboardingFollows from '../../components/forms/onboarding/follows/follows.vue';
import FormOnboardingProfile from '../../components/forms/onboarding/profile/profile.vue';

@Component({
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
	@AppState
	user!: AppStore['user'];

	isSocialRegistration = false;

	currentStep = 0;
	steps: (new () => OnboardingComponent<any>)[] = [FormOnboardingProfile, FormOnboardingFollows];

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
