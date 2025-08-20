import { RouteLocationNormalized } from 'vue-router';
import { commonStore } from '../../../_common/store/common-store';

export const HOME_FEED_FYP = 'fyp' as const;
export const HOME_FEED_ACTIVITY = 'activity' as const;

export type HomeFeedTabTypes = typeof HOME_FEED_FYP | typeof HOME_FEED_ACTIVITY;

export class HomeFeedService {
	public static getDefault() {
		if (shouldUseFYPDefault()) {
			return HOME_FEED_FYP;
		}
		return HOME_FEED_ACTIVITY;
	}

	public static get fypTab() {
		if (this.getDefault() === HOME_FEED_FYP) {
			return undefined;
		}
		return HOME_FEED_FYP;
	}

	public static get activityTab() {
		if (this.getDefault() === HOME_FEED_ACTIVITY) {
			return undefined;
		}
		return HOME_FEED_ACTIVITY;
	}

	public static getRouteFeedTab(route: RouteLocationNormalized) {
		// When no tab value is given, use the default tab.
		const tab = route.params?.tab;
		if (!tab) {
			return this.getDefault();
		}

		switch (tab) {
			case HOME_FEED_FYP:
			case HOME_FEED_ACTIVITY:
				return tab;
		}

		// For some other tab value, go to activity tab.
		return HOME_FEED_ACTIVITY;
	}
}

export function shouldUseFYPDefault() {
	const user = commonStore.user.value;

	if (!user || !user.created_on) {
		return true;
	}

	// This is the date that we pushed out a split test to show different
	// onboarding resources in the Welcome section. We want to roll this out to
	// everyone, though.
	//
	// https://github.com/gamejolt/gamejolt/commit/44632ce13e6eb7c428b70157c2e092149c275b32
	//
	// Wed Oct 26 2022 00:00:00 GMT+0000
	return user?.created_on >= 1666742400 * 1000;
}
