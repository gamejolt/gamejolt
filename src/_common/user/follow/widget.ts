import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { number } from '../../../vue/filters/number';
import { AppStore } from '../../../vue/services/app/app-store';
import { Analytics } from '../../analytics/analytics.service';
import { AppTrackEvent } from '../../analytics/track-event.directive';
import { AppAuthRequired } from '../../auth/auth-required-directive';
import { Growls } from '../../growls/growls.service';
import { findTooltipContainer } from '../../tooltip/container/container';
import { AppTooltip } from '../../tooltip/tooltip';
import { User } from '../user.model';

@Component({
	directives: {
		AppAuthRequired,
		AppTrackEvent,
		AppTooltip,
	},
})
export default class AppUserFollowWidget extends Vue {
	@Prop(User)
	user!: User;

	@Prop(Boolean)
	overlay?: boolean;

	@Prop(Boolean)
	circle?: boolean;

	@Prop(Boolean)
	block?: boolean;

	@Prop(Boolean)
	sm?: boolean;

	@Prop(Boolean)
	hideCount?: boolean;

	@Prop(String)
	eventLabel?: string;

	@State
	app!: AppStore;

	@Emit('follow')
	emitFollow() {}

	@Emit('unfollow')
	emitUnfollow() {}

	get shouldShow() {
		return !this.app.user || this.app.user.id !== this.user.id;
	}

	get badge() {
		return !this.circle && !this.hideCount && this.user.follower_count
			? number(this.user.follower_count)
			: '';
	}

	get tooltipContainer() {
		return findTooltipContainer(this);
	}

	get tooltip() {
		return !this.user.is_following
			? this.$gettext(`Follow this user to get their games, videos, and posts in your feed!`)
			: undefined;
	}

	get icon() {
		if (!this.circle) {
			return '';
		}

		return !this.user.is_following ? 'subscribe' : 'subscribed';
	}

	async onClick() {
		if (!this.app.user) {
			return;
		}

		const category = 'user-follow';
		const action = this.user.is_following ? 'unfollow' : 'follow';
		const label = this.eventLabel || 'any';
		Analytics.trackEvent(category, action, label);

		if (!this.user.is_following) {
			try {
				await this.user.$follow();
				this.emitFollow();
			} catch (e) {
				Growls.error(
					this.$gettext(`Something has prevented you from following this user.`)
				);
			}
		} else {
			try {
				await this.user.$unfollow();
				this.emitUnfollow();
			} catch (e) {
				Growls.error(this.$gettext(`For some reason we couldn't unfollow this user.`));
			}
		}
	}
}
