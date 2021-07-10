import { getAnalytics, logEvent, setCurrentScreen } from 'firebase/analytics';
import VueRouter from 'vue-router';
import { AppPromotionSource } from '../../utils/mobile-app';
import { Environment } from '../environment/environment.service';
import { getFirebaseApp } from '../firebase/firebase.service';
import { appStore } from '../store/app-store';
import { EventBus } from '../system/event/event-bus.service';

function getFirebaseAnalytics() {
	return getAnalytics(getFirebaseApp());
}

// Stub for SSR.
const gtag: any = (typeof window !== 'undefined' && (window as any).gtag) || function () {};

export class Analytics {
	static readonly SOCIAL_NETWORK_FB = 'facebook';
	static readonly SOCIAL_NETWORK_TWITTER = 'twitter';
	static readonly SOCIAL_NETWORK_TWITCH = 'twitch';
	static readonly SOCIAL_NETWORK_YOUTUBE = 'youtube';

	static readonly SOCIAL_ACTION_LIKE = 'like';
	static readonly SOCIAL_ACTION_SHARE = 'share';
	static readonly SOCIAL_ACTION_SEND = 'send';
	static readonly SOCIAL_ACTION_TWEET = 'tweet';
	static readonly SOCIAL_ACTION_FOLLOW = 'follow';
	static readonly SOCIAL_ACTION_SUBSCRIBE = 'subscribe';
	static readonly SOCIAL_ACTION_UNSUBSCRIBE = 'unsubscribe';

	static pageViewRecorded = false;

	static initRouter(router: VueRouter) {
		// Reset all page trackers since we're starting the page route.
		router.beforeEach((_to, _from, next) => {
			this.pageViewRecorded = false;
			next();
		});

		EventBus.on('routeChangeAfter', () => {
			const route = router.currentRoute;
			const analyticsPath = route.meta.analyticsPath;

			// Track the page view using the analyticsPath if we have one
			// assigned to the route meta.
			if (analyticsPath) {
				this.trackPageview(analyticsPath);
				return;
			}

			this.trackPageview(route.fullPath);
		});
	}

	private static get appUser() {
		return appStore.state.user;
	}

	private static get shouldTrack() {
		const user = this.appUser;

		// If they're not a normal user, don't track.
		if (GJ_BUILD_TYPE === 'production' && user && user.permission_level > 0) {
			return false;
		}

		return true;
	}

	static trackPageview(path?: string) {
		if (GJ_IS_SSR) {
			return;
		}

		// Gotta make sure the system has a chance to compile the title into the page.
		window.setTimeout(() => {
			this._trackPageview(path);
		});
	}

	private static _trackPageview(path?: string) {
		if (!this.shouldTrack) {
			console.log('Skip tracking page view since not a normal user.');
			return;
		}

		// Don't track the page view if it already was.
		if (this.pageViewRecorded) {
			return;
		}

		// If no path passed in, then pull it from the location.
		if (!path) {
			path = window.location.pathname + window.location.search + window.location.hash;
		}

		const analytics = getFirebaseAnalytics();

		// const options = {
		// 	page_path: path,
		// 	page_title: path,
		// 	user_id: this.appUser?.id,
		// };

		// Now track the page view.
		if (GJ_BUILD_TYPE === 'development') {
			console.log(`Track page view: ${path}`);
		} else {
			setCurrentScreen(analytics, path);
			// gtag('set', options);
			// // gtag('config', Environment.gaId);
			gtag('config', Environment.gaUniversalId);
		}

		this.pageViewRecorded = true;
	}

	static trackEvent(category: string, action: string, label?: string, value?: string) {
		return;

		// if (!this.shouldTrack) {
		// 	console.log('Skip tracking event since not a normal user.');
		// 	return;
		// }

		// if (Environment.buildType === 'development') {
		// 	console.log(
		// 		`Track event: ${category}:${action || '-'}:${label || '-'}:${value || '-'}`
		// 	);
		// } else {
		// 	const options = {
		// 		nonInteraction: 1,
		// 		hitCallback: true,
		// 	};

		// 	this.ga('send', 'event', category, action, label, value, options);
		// }
	}

	static async trackError(action: string, label?: string, value?: string) {
		this.trackEvent('errors', action, label, value);
	}

	static trackSocial(network: string, action: string, target: string) {
		return;

		// if (!this.shouldTrack) {
		// 	console.log('Skip tracking social event since not a normal user.');
		// 	return;
		// }

		// if (Environment.buildType === 'development') {
		// 	console.log(`Track social event: ${network}:${action}:${target}`);
		// } else {
		// 	this.ga('send', 'social', network, action, target, {
		// 		hitCallback: true,
		// 	});
		// }
	}

	static trackTiming(category: string, timingVar: string, value: number, label?: string) {
		return;

		// if (!this.shouldTrack) {
		// 	console.log('Skip tracking timing event since not a normal user.');
		// 	return;
		// }

		// console.info(`Timing (${category}${label ? ':' + label : ''}) ${timingVar} = ${value}`);

		// if (Environment.buildType === 'production') {
		// 	this.ga('send', 'timing', category, timingVar, value, label, {
		// 		hitCallback: true,
		// 	});
		// }
	}

	static setCurrentExperiment(experiment: string, variation: string | number) {
		return;

		// // If the chosen variation is -1, then they weren't chosen to run in this experiment, so we skip tracking.
		// if (variation === -1 || variation === '-1') {
		// 	return;
		// }

		// if (!this.shouldTrack) {
		// 	console.log('Skip setting experiment since not a normal user.');
		// 	return;
		// }

		// if (Environment.buildType === 'development') {
		// 	console.log(`Set new experiment: ${experiment} = ${variation}`);
		// } else {
		// 	ga('set', 'expId', experiment);
		// 	ga('set', 'expVar', '' + variation);
		// }
	}
}

function trackEvent(name: string, eventParams: Record<string, string | number>) {
	// We prefix with `x_` so that we know it is one of our own events.
	// gtag('event', `x_${name}`, eventParams);
	logEvent(getFirebaseAnalytics(), `x_${name}`, eventParams);

	console.log(`Track event.`, name, eventParams);
}

export function trackAppPromotionClick(options: { source: AppPromotionSource }) {
	trackEvent('app_promotion_click', {
		source: options.source,
	});
}
