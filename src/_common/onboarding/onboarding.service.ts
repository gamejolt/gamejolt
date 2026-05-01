export function isOnboarding() {
	return sessionStorage.getItem('onboarding-start') !== null;
}

export function startOnboarding() {
	sessionStorage.setItem('onboarding-start', Date.now().toString());
}

export function endOnboarding() {
	clearOnboardingStartTimestamp();
}

export function clearOnboardingStartTimestamp() {
	sessionStorage.removeItem('onboarding-start');
	// We previously used [localStorage]. Clear out old entries now that
	// they're no longer relevant.
	localStorage.removeItem('onboarding-start');
}
