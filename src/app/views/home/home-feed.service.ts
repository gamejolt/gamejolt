import { RouteLocationNormalized } from 'vue-router';
import { configFYPDefault } from '../../../_common/config/config.service';

export const HOME_FEED_FYP = 'fyp';
export const HOME_FEED_ACTIVITY = 'activity';

export class HomeFeedService {
	public static getDefault() {
		return configFYPDefault.value ? HOME_FEED_FYP : HOME_FEED_ACTIVITY;
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
		switch (route.params?.tab) {
			case HOME_FEED_FYP:
			case this.fypTab:
				return HOME_FEED_FYP;
			case HOME_FEED_ACTIVITY:
			case this.activityTab:
				return HOME_FEED_ACTIVITY;
		}

		// For some other tab value, go to activity tab.
		return HOME_FEED_ACTIVITY;
	}
}
