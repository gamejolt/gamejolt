import { RouteLocationNormalized } from 'vue-router';
import { configHomeDefaultFeed } from '../../../_common/config/config.service';

export const HOME_FEED_FYP = 'fyp';
export const HOME_FEED_ACTIVITY = 'activity';

export class HomeFeedService {
	public static getDefault() {
		return configHomeDefaultFeed.value;
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
		if (!route.params?.tab) {
			return this.getDefault();
		}

		switch (route.params?.tab) {
			case HOME_FEED_FYP:
				return HOME_FEED_FYP;
			case HOME_FEED_ACTIVITY:
				return HOME_FEED_ACTIVITY;
		}

		// For some other tab value, go to activity tab.
		return HOME_FEED_ACTIVITY;
	}
}
