import {
	Analytics as FirebaseAnalytics,
	initializeAnalytics,
	logEvent,
	setCurrentScreen,
	setUserId,
} from 'firebase/analytics';
import VueRouter from 'vue-router';
import { arrayRemove } from '../../utils/array';
import { AppPromotionSource } from '../../utils/mobile-app';
import { AuthMethod } from '../auth/auth.service';
import { ConfigOption } from '../config/config.service';
import { getFirebaseApp } from '../firebase/firebase.service';
import { WithAppStore } from '../store/app-store';
import { EventBus } from '../system/event/event-bus.service';

export const SOCIAL_NETWORK_FB = 'facebook';
export const SOCIAL_NETWORK_TWITTER = 'twitter';

export const SOCIAL_ACTION_LIKE = 'like';
export const SOCIAL_ACTION_SEND = 'send';
export const SOCIAL_ACTION_TWEET = 'tweet';
export const SOCIAL_ACTION_FOLLOW = 'follow';

export type PostControlsLocation = 'feed' | 'broadcast' | 'postPage';

/**
 * How long we wait (in ms) before we track another experiment engagement for
 * the same config option.
 */
const EXP_ENGAGEMENT_EXPIRY = 5 * 60 * 1_000;

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
	if (GJ_IS_SSR || GJ_IS_CLIENT) {
		return;
	}

	_store = store;

	_store.watch(
		state => state.app.user,
		user => {
			if (user?.id) {
				_trackUserId(user.id);
			} else {
				_untrackUserId();
			}
		}
	);
}

/**
 * Can be called to hook into the router to track pageviews automatically.
 */
export function initAnalyticsRouter(router: VueRouter) {
	if (GJ_IS_SSR || GJ_IS_CLIENT) {
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
			_trackPageview(analyticsPath);
			return;
		}

		_trackPageview(route.fullPath);
	});
}

function _trackPageview(path?: string) {
	if (GJ_IS_SSR || GJ_IS_CLIENT) {
		return;
	}

	// Gotta make sure the system has a chance to compile the title into the page.
	window.setTimeout(() => {
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
	});
}

/**
 * Sets the current user ID into analytics.
 */
function _trackUserId(id: number) {
	setUserId(_getFirebaseAnalytics(), `${id}`);
}

/**
 * When the user is no longer logged in, can use this to unset the user from
 * analytics.
 */
function _untrackUserId() {
	// TODO: Check to make sure this actually works.
	setUserId(_getFirebaseAnalytics(), '');
}

function _trackEvent(name: string, eventParams: Record<string, string | number | undefined>) {
	if (GJ_IS_SSR || GJ_IS_CLIENT) {
		return;
	}

	// We prefix with `x_` so that we know it is one of our own events.
	logEvent(_getFirebaseAnalytics(), `x_${name}`, eventParams);
	console.log(`Track event.`, name, eventParams);
}

const _expEngagements: { time: number; configOption: ConfigOption }[] = [];

function _getExperimentKey(option: ConfigOption) {
	// Limits:
	// https://support.google.com/analytics/answer/9267744?hl=en
	return 'exp_' + option.name.substr(0, 35);
}

function _getExperimentValue(option: ConfigOption) {
	const value = option.isOverridden
		? `overridden-${option.value}`
		: option.isExcluded
		? 'excluded'
		: `${option.value}`;

	// Limits:
	// https://support.google.com/analytics/answer/9267744?hl=en
	return value.substr(0, 95);
}

/**
 * Track their remote config data as the experiments so that we can segment and
 * target based on what they saw.
 */
export function trackExperiments(configOptions: ConfigOption[]) {
	const activeOptions: Record<string, string> = {};
	for (const option of configOptions) {
		activeOptions[_getExperimentKey(option)] = _getExperimentValue(option);
	}

	// Limits:
	// https://support.google.com/analytics/answer/9267744?hl=en
	const slicedEntries = Object.entries(activeOptions).slice(0, 20);

	_trackEvent('experiments', Object.fromEntries(slicedEntries));
}

/**
 * Used to track anytime they see an actual experiment or engage with it in any
 * way. This allows us to know when they actually saw an experiment vs just
 * knowing that they MIGHT see an experiment.
 *
 * We rate limit this so that it doesn't trigger too much.
 */
export function trackExperimentEngagement(option: ConfigOption) {
	// If we already tracked an experiment engagement for this config option
	// within the expiry time, we want to ignore.
	const prevEngagement = _expEngagements.find(
		i => i.configOption === option && i.time > Date.now() - EXP_ENGAGEMENT_EXPIRY
	);
	if (prevEngagement) {
		return;
	}

	_trackEvent('experiment_engagement', {
		[_getExperimentKey(option)]: _getExperimentValue(option),
	});

	arrayRemove(_expEngagements, i => i.configOption === option);
	_expEngagements.push({ configOption: option, time: Date.now() });
}

export function trackLogin(method: AuthMethod) {
	if (GJ_IS_SSR || GJ_IS_CLIENT) {
		return;
	}

	logEvent(_getFirebaseAnalytics(), 'login', { method });
}

export function trackJoin(method: AuthMethod) {
	if (GJ_IS_SSR || GJ_IS_CLIENT) {
		return;
	}

	logEvent(_getFirebaseAnalytics(), 'sign_up', { method });
}

export function trackAppPromotionClick(options: { source: AppPromotionSource }) {
	_trackEvent('app_promotion_click', {
		source: options.source,
	});
}

export type CommunityOpenSource = 'communityChunk' | 'communityCard';

export function trackGotoCommunity(params: {
	source: CommunityOpenSource;
	id?: number;
	path?: string;
	channel?: string;
}) {
	_trackEvent('goto_community', params);
}

export type PostOpenSource = 'communityChunk' | 'postRecommendation';

export function trackPostOpen(params: { source: PostOpenSource }) {
	_trackEvent('post_open', params);
}

export function trackPostLike(params: { location: PostControlsLocation }) {
	_trackEvent('post_like', params);
}

export function trackPostUnlike(params: { location: PostControlsLocation }) {
	_trackEvent('post_unlike', params);
}

/**
 * @deprecated This is left here so that old code doesn't break.
 */
export class Analytics {
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
