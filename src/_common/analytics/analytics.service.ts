import {
	Analytics as FirebaseAnalytics,
	initializeAnalytics,
	logEvent,
	setCurrentScreen,
	setUserId,
} from 'firebase/analytics';
import VueRouter from 'vue-router';
import { AppPromotionSource } from '../../utils/mobile-app';
import { getFirebaseApp } from '../firebase/firebase.service';
import { WithAppStore } from '../store/app-store';
import { EventBus } from '../system/event/event-bus.service';

let _store: WithAppStore;
let _pageViewRecorded = false;

let _analytics: FirebaseAnalytics;
function _getFirebaseAnalytics() {
	_analytics ??= initializeAnalytics(getFirebaseApp(), { config: { send_page_view: false } });
	return _analytics;
}

function _getStoreUser() {
	return _store.state.app.user;
}

function _shouldTrack() {
	const user = _getStoreUser();

	// If they're not a normal user, don't track.
	if (GJ_BUILD_TYPE === 'production' && user && user.permission_level > 0) {
		return false;
	}

	return true;
}

/**
 * Initializes the analytics for use with the current app.
 */
export function initAnalytics(store: WithAppStore) {
	if (GJ_IS_SSR) {
		return;
	}

	_store = store;

	_store.watch(
		(state) => state.app.user,
		(user) => {
			if (user?.id) {
				trackUserId(user.id);
			} else {
				untrackUserId();
			}
		}
	);
}

/**
 * Can be called to hook into the router to track pageviews automatically.
 */
export function initAnalyticsRouter(router: VueRouter) {
	if (GJ_IS_SSR) {
		return;
	}

	// Reset all page trackers since we're starting the page route.
	router.beforeEach((_to, _from, next) => {
		_pageViewRecorded = false;
		next();
	});

	EventBus.on('routeChangeAfter', () => {
		const route = router.currentRoute;
		const analyticsPath = route.meta.analyticsPath;

		// Track the page view using the analyticsPath if we have one
		// assigned to the route meta.
		if (analyticsPath) {
			trackPageview(analyticsPath);
			return;
		}

		trackPageview(route.fullPath);
	});
}

/**
 * Tracks a pageview.
 */
export function trackPageview(path?: string) {
	if (GJ_IS_SSR) {
		return;
	}

	// Gotta make sure the system has a chance to compile the title into the page.
	window.setTimeout(() => {
		_trackPageview(path);
	});
}

function _trackPageview(path?: string) {
	if (!_shouldTrack()) {
		console.log('Skip tracking page view since not a normal user.');
		return;
	}

	// Don't track the page view if it already was.
	if (_pageViewRecorded) {
		return;
	}

	// If no path passed in, then pull it from the location.
	if (!path) {
		path = window.location.pathname + window.location.search + window.location.hash;
	}

	const analytics = _getFirebaseAnalytics();

	// Now track the page view.
	if (GJ_BUILD_TYPE === 'development') {
		console.log(`Track page view: ${path}`);
	} else {
		// We have to manually log the page_view event. Setting the current
		// screen will set that screen variable for all future events.
		setCurrentScreen(analytics, path);
		logEvent(_getFirebaseAnalytics(), 'page_view', { page_path: path, page_title: path });
	}

	_pageViewRecorded = true;
}

/**
 * Sets the current user ID into analytics.
 */
export function trackUserId(id: number) {
	setUserId(_getFirebaseAnalytics(), `${id}`);
}

/**
 * When the user is no longer logged in, can use this to unset the user from
 * analytics.
 */
export function untrackUserId() {
	// TODO: Check to make sure this actually works.
	setUserId(_getFirebaseAnalytics(), '');
}

function _trackEvent(name: string, eventParams: Record<string, string | number>) {
	// We prefix with `x_` so that we know it is one of our own events.
	logEvent(_getFirebaseAnalytics(), `x_${name}`, eventParams);
	console.log(`Track event.`, name, eventParams);
}

export function trackAppPromotionClick(options: { source: AppPromotionSource }) {
	_trackEvent('app_promotion_click', {
		source: options.source,
	});
}

/**
 * @deprecated This is left here so that old code doesn't break.
 */
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
}
