import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { trackUserFollow, UserFollowLocation } from '../../analytics/analytics.service';
import { AppAuthRequired } from '../../auth/auth-required-directive';
import { number } from '../../filters/number';
import { Growls } from '../../growls/growls.service';
import { ModalConfirm } from '../../modal/confirm/confirm-service';
import { AppStore } from '../../store/app-store';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import { followUser, unfollowUser, User } from '../user.model';

@Component({
	directives: {
		AppAuthRequired,
		AppTooltip,
	},
})
export default class AppUserFollowWidget extends Vue {
	@Prop({ type: User, required: true })
	user!: User;

	@Prop({ type: String, required: true })
	location!: UserFollowLocation;

	@Prop({ type: Boolean, required: false, default: false })
	overlay!: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	circle!: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	block!: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	sm!: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	hideCount!: boolean;

	@State app!: AppStore;

	@Emit('follow')
	emitFollow() {}

	@Emit('unfollow')
	emitUnfollow() {}

	get shouldShow() {
		if (!this.app.user) {
			return true;
		}
		if (this.app.user.id !== this.user.id && !this.user.blocked_you && !this.user.is_blocked) {
			return true;
		}
		return false;
	}

	get badge() {
		return !this.circle && !this.hideCount && this.user.follower_count
			? number(this.user.follower_count)
			: '';
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

		let failed = false;
		if (!this.user.is_following) {
			try {
				await followUser(this.user);
				this.emitFollow();
			} catch (e) {
				failed = true;
				Growls.error(
					this.$gettext(`Something has prevented you from following this user.`)
				);
			} finally {
				trackUserFollow(true, { failed, location: this.location });
			}
		} else {
			try {
				const result = await ModalConfirm.show(
					this.$gettext(`Are you sure you want to unfollow this user?`),
					this.$gettext(`Unfollow user?`)
				);

				if (!result) {
					return;
				}

				await unfollowUser(this.user);
				this.emitUnfollow();
			} catch (e) {
				failed = true;
				Growls.error(this.$gettext(`For some reason we couldn't unfollow this user.`));
			} finally {
				trackUserFollow(false, { failed, location: this.location });
			}
		}
	}
}
