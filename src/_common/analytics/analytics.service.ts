import VueRouter from 'vue-router';
import { arrayRemove } from '../../utils/array';
import { appStore } from '../../vue/services/app/app-store';
import { Environment } from '../environment/environment.service';
import { EventBus } from '../event-bus/event-bus.service';

const ga: any = (typeof window !== 'undefined' && (window as any).ga) || function() {};

// Force HTTPS tracking beacons.
ga('set', 'forceSSL', true);

// Allow file:// and chrome-extension:// protocols for Client or App.
// https://discuss.atom.io/t/google-analytics-in-atom-shell/14109/7
ga('set', 'checkProtocolTask', null);

// IP masking.
// https://developers.google.com/analytics/devguides/collection/analyticsjs/ip-anonymization
ga('set', 'anonymizeIp', true);

class PageTracker {
	pageViewRecorded = false;

	get normalizedId() {
		return this.id.replace(/[\-_:]/g, '');
	}

	constructor(public id = '') {}
}

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

	private static pageTrackers = [new PageTracker()];
	private static addedTrackers: string[] = [];

	static initRouter(router: VueRouter) {
		// Reset all page trackers since we're starting the page route.
		router.beforeEach((_to, _from, next) => {
			this.pageTrackers.forEach(i => (i.pageViewRecorded = false));
			next();
		});

		EventBus.on('routeChangeAfter', () => {
			this.trackPageview(router.currentRoute.fullPath);
		});
	}

	private static get appUser() {
		return appStore.state.user;
	}

	private static get shouldTrack() {
		const user = this.appUser;

		// If they're not a normal user, don't track.
		if (Environment.buildType === 'production' && user && user.permission_level > 0) {
			return false;
		}

		return true;
	}

	private static ga(...args: any[]) {
		if (GJ_IS_SSR) {
			return;
		}

		return new Promise(resolve => {
			let called = false;
			function cb() {
				if (!called) {
					called = true;
					resolve();
				}
			}

			// If we set hitCallback to true for the options of this call, then
			// we want to be alerted when the command is finished. We limit it
			// with a timeout in this case.
			const lastArg = args[args.length - 1];
			if (typeof lastArg === 'object' && lastArg.hitCallback) {
				// This will ensure that resolve() gets called at least within 1s.
				lastArg.hitCallback = cb;
				window.setTimeout(cb, 1000);
				ga.apply(null, args);
			} else {
				// Otherwise do it immediately.
				ga.apply(null, args);
				cb();
			}
		});
	}

	static trackPageview(path?: string) {
		if (GJ_IS_SSR) {
			return;
		}

		// Gotta make sure the system has a chance to compile the title into the page.
		window.setTimeout(() => {
			this.pageTrackers.forEach(i => this._trackPageview(i, path));
		});
	}

	private static _trackPageview(tracker: PageTracker, path?: string) {
		if (!this.shouldTrack) {
			console.log('Skip tracking page view since not a normal user.');
			return;
		}

		if (tracker.pageViewRecorded) {
			console.log('Page view already recorded for this tracker.');
			return;
		}

		let method = 'send';

		// Did they pass in a tracker other than the default?
		if (tracker.id !== '') {
			// Prefix the method with the tracker.
			method = tracker.normalizedId + '.' + method;

			// If we haven't added this tracker yet in GA, let's do so.
			if (this.addedTrackers.indexOf(tracker.id) === -1) {
				// Save that we have this tracker set.
				this.addedTrackers.push(tracker.id);

				// Now add it in GA.
				if (Environment.buildType === 'development') {
					console.log('Create new tracker: ' + tracker.id);
				} else {
					this.ga('create', tracker.id, 'auto', { name: tracker.normalizedId });
				}
			}
		}

		// If no path passed in, then pull it from the location.
		if (!path) {
			path = window.location.pathname + window.location.search + window.location.hash;
		}

		// Pull the title.
		const title = window.document.title;

		const options = {
			page: path,
			title: title,
		};

		// Now track the page view.
		if (Environment.buildType === 'development') {
			console.log(`Track page view: tracker(${tracker.id}) | ${JSON.stringify(options)}`);
		} else {
			this.ga(method, 'pageview', { ...options });
		}

		tracker.pageViewRecorded = true;
	}

	static async trackEvent(category: string, action: string, label?: string, value?: string) {
		if (!this.shouldTrack) {
			console.log('Skip tracking event since not a normal user.');
			return;
		}

		if (Environment.buildType === 'development') {
			console.log(
				`Track event: ${category}:${action || '-'}:${label || '-'}:${value || '-'}`
			);
		} else {
			const options = {
				nonInteraction: 1,
				hitCallback: true,
			};

			await this.ga('send', 'event', category, action, label, value, options);
		}
	}

	static async trackError(action: string, label?: string, value?: string) {
		this.trackEvent('errors', action, label, value);
	}

	static async trackSocial(network: string, action: string, target: string) {
		if (!this.shouldTrack) {
			console.log('Skip tracking social event since not a normal user.');
			return;
		}

		if (Environment.buildType === 'development') {
			console.log(`Track social event: ${network}:${action}:${target}`);
		} else {
			this.ga('send', 'social', network, action, target, {
				hitCallback: true,
			});
		}
	}

	static async trackTiming(category: string, timingVar: string, value: number, label?: string) {
		if (!this.shouldTrack) {
			console.log('Skip tracking timing event since not a normal user.');
			return;
		}

		console.info(`Timing (${category}${label ? ':' + label : ''}) ${timingVar} = ${value}`);

		if (Environment.buildType === 'production') {
			this.ga('send', 'timing', category, timingVar, value, label, {
				hitCallback: true,
			});
		}
	}

	static setCurrentExperiment(experiment: string, variation: string | number) {
		// If the chosen variation is -1, then they weren't chosen to run in this experiment, so we skip tracking.
		if (variation === -1 || variation === '-1') {
			return;
		}

		if (!this.shouldTrack) {
			console.log('Skip setting experiment since not a normal user.');
			return;
		}

		if (Environment.buildType === 'development') {
			console.log(`Set new experiment: ${experiment} = ${variation}`);
		} else {
			ga('set', 'expId', experiment);
			ga('set', 'expVar', '' + variation);
		}
	}

	static attachAdditionalPageTracker(trackingId: string) {
		const index = this.pageTrackers.findIndex(i => i.id === trackingId);
		if (index !== -1) {
			return;
		}

		if (Environment.buildType === 'development') {
			console.log(`Attached additional tracker: ${trackingId}`);
		}

		const tracker = new PageTracker(trackingId);
		this.pageTrackers.push(tracker);
	}

	static detachAdditionalPageTracker(trackingId: string) {
		if (Environment.buildType === 'development') {
			console.log(`Detached additional tracker: ${trackingId}`);
		}

		arrayRemove(this.pageTrackers, i => i.id === trackingId);
	}
}
