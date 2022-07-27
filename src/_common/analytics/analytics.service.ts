import {
	Analytics as FirebaseAnalytics,
	initializeAnalytics,
	logEvent,
	setCurrentScreen,
	setUserId,
	setUserProperties,
} from 'firebase/analytics';
import { unref, watch } from 'vue';
import { Router } from 'vue-router';
import { arrayRemove } from '../../utils/array';
import { createLogger } from '../../utils/logging';
import { AuthMethod } from '../auth/auth.service';
import { CommentVote } from '../comment/vote/vote-model';
import { ConfigOption } from '../config/config.service';
import { DeviceArch, DeviceOs } from '../device/device.service';
import { getFirebaseApp } from '../firebase/firebase.service';
import { AppPromotionSource } from '../mobile-app/store';
import { onRouteChangeAfter } from '../route/route-component';
import { SettingThemeDark } from '../settings/settings.service';
import { ShareProvider, ShareResource } from '../share/share.service';
import { CommonStore } from '../store/common-store';
import { getTranslationLang } from '../translate/translate.service';

export const SOCIAL_NETWORK_FB = 'facebook';
export const SOCIAL_NETWORK_TWITTER = 'twitter';

export const SOCIAL_ACTION_LIKE = 'like';
export const SOCIAL_ACTION_SEND = 'send';
export const SOCIAL_ACTION_TWEET = 'tweet';
export const SOCIAL_ACTION_FOLLOW = 'follow';

export type CommunityOpenSource = 'communityChunk' | 'card' | 'cbar' | 'thumbnail';
export type CommunityJoinLocation = 'onboarding' | 'card' | 'communityPage' | 'homeBanner' | 'cbar';
export type PostOpenSource = 'realmChunk' | 'communityChunk' | 'postRecommendation' | 'feed';
export type PostControlsLocation = 'feed' | 'broadcast' | 'postPage';
export type UserFollowLocation =
	| 'feed'
	| 'postPage'
	| 'postLike'
	| 'card'
	| 'profilePage'
	| 'inviteFollow'
	| 'firesideOfflineFollow'
	| 'userList'
	| 'gameFollow';
export type GameFollowLocation = 'thumbnail' | 'gamePage' | 'badge' | 'homeBanner' | 'library';
export type RealmOpenSource = 'realmChunk' | 'realmChunkPost';
export type RealmFollowSource = 'realmChunk' | 'fullCard' | 'realmHeader';
export type BannerType = 'store';

const logger = createLogger('Analytics');

/**
 * How long we wait (in ms) before we track another experiment engagement for
 * the same config option.
 */
const EXP_ENGAGEMENT_EXPIRY = 5 * 60 * 1_000;

let _store: CommonStore;
let _pageViewRecorded = false;

let _analytics: FirebaseAnalytics;
function _getFirebaseAnalytics() {
	_analytics ??= initializeAnalytics(getFirebaseApp(), { config: { send_page_view: false } });
	return _analytics;
}

function _getStoreUser() {
	return _store.user.value;
}

function _shouldTrack() {
	const user = _getStoreUser();

	// Usually we don't want our staff accounts to count in analytics. That
	// said, we need to allow tracking staff account while developing so we can
	// actually test this.
	const isStaffUser = user && user.permission_level > 0;
	if (isStaffUser) {
		// Allow staff users to get tracked in development or when making a staging build.
		return GJ_ENVIRONMENT === 'development' || GJ_IS_STAGING;
	}

	return true;
}

/**
 * Initializes the analytics for use with the current app.
 */
export function initAnalytics({ commonStore }: { commonStore: CommonStore }) {
	if (import.meta.env.SSR || GJ_IS_DESKTOP_APP) {
		return;
	}

	_store = commonStore;

	watch(
		() => unref(commonStore.user),
		user => {
			if (user?.id) {
				_trackUserId(user.id);
			} else {
				_untrackUserId();
			}
		}
	);

	watch(
		() => ({
			light_mode: SettingThemeDark.get() ? false : true,
			lang: getTranslationLang(),
		}),
		properties => {
			_trackUserProperties(properties);
		},
		{ immediate: true }
	);
}

/**
 * Can be called to hook into the router to track pageviews automatically.
 */
export function initAnalyticsRouter(router: Router) {
	if (import.meta.env.SSR || GJ_IS_DESKTOP_APP) {
		return;
	}

	// Reset all page trackers since we're starting the page route.
	router.beforeEach((_to, _from, next) => {
		_pageViewRecorded = false;
		next();
	});

	onRouteChangeAfter.subscribe(() => {
		const route = router.currentRoute.value;
		const analyticsPath = route.meta.analyticsPath as string | undefined;

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
	if (import.meta.env.SSR || GJ_IS_DESKTOP_APP) {
		return;
	}

	// Gotta make sure the system has a chance to compile the title into the page.
	window.setTimeout(() => {
		if (!_shouldTrack()) {
			logger.warn('Skip tracking page view since not a normal user.');
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
		//
		// Avoid tracking page views while developing.
		if (GJ_BUILD_TYPE === 'serve-hmr' || GJ_BUILD_TYPE === 'serve-build') {
			logger.info(`Track page view: ${path}`);
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

function _trackUserProperties(properties: { light_mode: boolean; lang: string }) {
	if (import.meta.env.SSR || GJ_IS_DESKTOP_APP) {
		return;
	}

	logger.info(`User properties changed.`, properties);
	setUserProperties(_getFirebaseAnalytics(), properties);
}

function _trackEvent(
	name: string,
	eventParams: Record<string, string | number | boolean | undefined>
) {
	if (import.meta.env.SSR || GJ_IS_DESKTOP_APP) {
		return;
	}

	// We prefix with `x_` so that we know it is one of our own events.
	logEvent(_getFirebaseAnalytics(), `x_${name}`, eventParams);
	logger.info(`Track event.`, name, eventParams);
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
	if (import.meta.env.SSR || GJ_IS_DESKTOP_APP) {
		return;
	}

	logEvent(_getFirebaseAnalytics(), 'login', { method });
}

export function trackJoin(method: AuthMethod) {
	if (import.meta.env.SSR || GJ_IS_DESKTOP_APP) {
		return;
	}

	logEvent(_getFirebaseAnalytics(), 'sign_up', { method });
}

export function trackAppPromotionClick(options: {
	source: AppPromotionSource;
	platform: 'desktop' | 'mobile';
}) {
	_trackEvent('app_promotion_click', {
		source: options.source,
	});
}

export function trackAppDownload(options: { platform: DeviceOs; arch: DeviceArch }) {
	_trackEvent('app_download', options);
}

export function trackGotoCommunity(params: {
	source: CommunityOpenSource;
	id?: number;
	path?: string;
	channel?: string;
}) {
	_trackEvent('goto_community', params);
}

export function trackGotoRealm(params: { path: string; source: RealmOpenSource }) {
	_trackEvent('goto_realm', params);
}

export function trackPostOpen(params: { source: PostOpenSource }) {
	_trackEvent('post_open', params);
}

export function trackPostLike(
	liked: boolean,
	params: { failed: boolean; location: PostControlsLocation }
) {
	const { failed, location } = params;

	let type = liked ? 'like' : 'unlike';
	if (failed) {
		type += '_fail';
	}

	_trackEvent(`post_${type}`, { location });
}

export function trackCommentVote(vote: number, params: { failed: boolean; toggled: boolean }) {
	const { failed, toggled } = params;

	let type = '';
	if (vote === CommentVote.VOTE_UPVOTE) {
		type = 'like';
	} else if (vote === CommentVote.VOTE_DOWNVOTE) {
		type = 'dislike';
	} else {
		return;
	}

	if (failed) {
		type += '_fail';
	}

	_trackEvent(`comment_${type}`, { toggled });
}

export function trackUserFollow(
	followed: boolean,
	params: { failed: boolean; location: UserFollowLocation }
) {
	const { failed, location } = params;

	let type = followed ? 'follow' : 'unfollow';
	if (failed) {
		type += '_fail';
	}

	_trackEvent(`user_${type}`, { location });
}

export function trackGameFollow(
	followed: boolean,
	params: { failed: boolean; location: GameFollowLocation }
) {
	const { failed, location } = params;

	let type = followed ? 'follow' : 'unfollow';
	if (failed) {
		type += '_fail';
	}

	_trackEvent(`game_${type}`, { location });
}

export function trackCommunityJoin(
	joined: boolean,
	params: { failed: boolean; location: CommunityJoinLocation }
) {
	const { failed, location } = params;

	let type = joined ? 'join' : 'leave';
	if (failed) {
		type += '_fail';
	}

	_trackEvent(`community_${type}`, { location });
}

export function trackRealmFollow(
	followed: boolean,
	params: { failed?: boolean; source: RealmFollowSource }
) {
	const { failed, source } = params;

	let type = followed ? 'follow' : 'unfollow';
	if (failed) {
		type += '_fail';
	}

	_trackEvent(`realm_${type}`, { source });
}

export function trackCommentAdd() {
	_trackEvent('comment_add', {});
}

export function trackPostPublish() {
	_trackEvent('post_publish', {});
}

export function trackShareLink(
	url: string,
	params: { resource: ShareResource; provider?: ShareProvider }
) {
	const { provider, resource } = params;
	const method = provider ? 'external' : 'copy';

	_trackEvent('share_link', {
		url: encodeURI(url),
		method,
		provider,
		resource,
	});
}

export function trackLoginCaptcha(
	username: string,
	status: 'presented' | 'solved' | 'failed',
	counter: number
) {
	_trackEvent('login_captcha', {
		username,
		status,
		counter,
	});
}

export function trackBannerClick(params: { type: BannerType; label?: string }) {
	_trackEvent('banner_click', params);
}

/**
 * @deprecated This is left here so that old code doesn't break.
 */
export class Analytics {
	static trackEvent(_category: string, _action: string, _label?: string, _value?: string) {
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

	static trackSocial(_network: string, _action: string, _target: string) {
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

	static trackTiming(_category: string, _timingVar: string, _value: number, _label?: string) {
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
