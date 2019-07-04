import AppUserFollowWidget from 'game-jolt-frontend-lib/components/user/follow/widget.vue';
import AppUserAvatar from 'game-jolt-frontend-lib/components/user/user-avatar/user-avatar.vue';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { Analytics } from '../../../../lib/gj-lib-client/components/analytics/analytics.service';
import AppUserList from '../../../components/user/list/list.vue';

@Component({
	components: {
		AppUserAvatar,
		AppUserFollowWidget,
		AppLoading,
		AppUserList,
	},
})
export default class AppHomeRecommended extends Vue {
	@Prop(Array)
	users!: User[];

	@Prop(Boolean)
	loading!: boolean;

	followCount = 0;

	// When navigating away we only want to log actions taken if any action was taken.
	// Checking followCount == 0 doesn't cut it because if a user was followed and unfollowed
	// we'd still want to log the actions taken, just with a 0 value.
	shouldLog = false;

	readonly eventLabel = 'activity';

	@Emit('refresh')
	emitRefresh() {}

	refresh() {
		this.logActionsTaken();
		this.emitRefresh();
	}

	onFollow() {
		this.followCount++;
		this.shouldLog = true;
	}

	onUnfollow() {
		this.followCount--;
		this.shouldLog = true;
	}

	logActionsTaken() {
		Analytics.trackEvent(
			'who-to-follow',
			`actions-taken:${this.followCount}`,
			this.eventLabel,
			this.followCount + ''
		);
		this.followCount = 0;
		this.shouldLog = false;
	}

	destroyed() {
		if (this.shouldLog) {
			this.logActionsTaken();
		}
	}
}
