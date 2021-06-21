import { Route } from 'vue-router/types/router';
import { SettingDefaultFeed } from '../../../_common/settings/settings.service';

export const DEFAULT_FEED_FYP = 'fyp';
export const DEFAULT_FEED_ACTIVITY = 'activity';

export default class DefaultFeed {
	public static getDefault() {
		return SettingDefaultFeed.get();
	}

	public static get fypTab() {
		if (this.getDefault() === DEFAULT_FEED_FYP) {
			return undefined;
		}
		return 'fyp';
	}

	public static get activityTab() {
		if (this.getDefault() === DEFAULT_FEED_ACTIVITY) {
			return undefined;
		}
		return 'activity';
	}

	public static getRouteFeedTab(route: Route) {
		switch (route.params?.tab) {
			case DEFAULT_FEED_FYP:
			case this.fypTab:
				return DEFAULT_FEED_FYP;
			case DEFAULT_FEED_ACTIVITY:
			case this.activityTab:
				return DEFAULT_FEED_ACTIVITY;
		}

		// For some other tab value, go to activity tab.
		return DEFAULT_FEED_ACTIVITY;
	}
}
