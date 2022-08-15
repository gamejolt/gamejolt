import { Analytics } from '../analytics/analytics.service';
export type OnboardingStep = 'profile' | 'follows';

export default abstract class Onboarding {
	private static _currentStep: OnboardingStep | null = null;
	private static _currentStepStartedOn = 0;

	static get isOnboarding() {
		return sessionStorage.getItem('onboarding-start') !== null;
	}

	static start() {
		sessionStorage.setItem('onboarding-start', Date.now().toString());
	}

	static end() {
		const onboardStartedOn = parseInt(sessionStorage.getItem('onboarding-start') || '0', 10);
		if (onboardStartedOn) {
			this.trackTiming('flow-all-took', Date.now() - onboardStartedOn);
			this.clearOnboardingStartTimestamp();
		}
	}

	static clearOnboardingStartTimestamp() {
		sessionStorage.removeItem('onboarding-start');
		// We previously used [localStorage]. Clear out old entries now that
		// they're no longer relevant.
		localStorage.removeItem('onboarding-start');
	}

	static startStep(step: OnboardingStep) {
		this.trackEvent(`flow-${step}-start`);

		this._currentStep = step;
		this._currentStepStartedOn = Date.now();
	}

	static endStep(skipped: boolean) {
		const operation = skipped ? 'skip' : 'next';
		this.trackEvent(`flow-${this._currentStep}-${operation}`);
		this.trackTiming(`flow-${this._currentStep}-took`, Date.now() - this._currentStepStartedOn);

		this._currentStep = null;
		this._currentStepStartedOn = 0;
	}

	static trackEvent(action: string, label?: string, value?: string) {
		// Skip tracking if already onboarded.
		// This may happen if the onboard tab is open twice.
		// Currently the only place this happens is in non social registrations.
		if (this.isOnboarding) {
			Analytics.trackEvent('onboarding', action, label, value);
		}
	}

	static trackTiming(timingVar: string, value: number, label?: string) {
		// Skip tracking if already onboarded.
		// This may happen if the onboard tab is open twice.
		// Currently the only place this happens is in non social registrations.
		if (this.isOnboarding) {
			Analytics.trackTiming('onboarding', timingVar, value, label);
		}
	}
}
