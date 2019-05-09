import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import AppFormButton from 'game-jolt-frontend-lib/components/form-vue/button/button.vue';
import Onboarding from 'game-jolt-frontend-lib/components/onboarding/onboarding.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { AppState, AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import { Component } from 'vue-property-decorator';
import { Auth } from '../../../lib/gj-lib-client/components/auth/auth.service';
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
		// Since the app section and auth section may run on different ports
		// the local storage key used to start the onboarding flow might not be available.
		// This allows us to test in dev.
		if (GJ_ENVIRONMENT === 'development') {
			Onboarding.start();
		}

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
			Auth.redirectDashboard();
			return;
		}

		this.currentStep++;
	}
}
