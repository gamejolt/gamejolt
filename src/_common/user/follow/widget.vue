<script lang="ts">
import { setup } from 'vue-class-component';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { trackUserFollow, UserFollowLocation } from '../../analytics/analytics.service';
import { vAppAuthRequired } from '../../auth/auth-required-directive';
import { formatNumber } from '../../filters/number';
import { showErrorGrowl } from '../../growls/growls.service';
import { ModalConfirm } from '../../modal/confirm/confirm-service';
import { useCommonStore } from '../../store/common-store';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import { followUser, unfollowUser, User } from '../user.model';

@Options({
	directives: {
		AppAuthRequired: vAppAuthRequired,
		AppTooltip: vAppTooltip,
	},
})
export default class AppUserFollowWidget extends Vue {
	@Prop({ type: Object, required: true })
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

	@Prop({ type: Boolean, required: false, default: false })
	disabled!: boolean;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

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
			? formatNumber(this.user.follower_count)
			: '';
	}

	get tooltip() {
		return !this.user.is_following
			? this.$gettext(`Follow this user to get their posts in your feed!`)
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
				showErrorGrowl(
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
				showErrorGrowl(this.$gettext(`For some reason we couldn't unfollow this user.`));
			} finally {
				trackUserFollow(false, { failed, location: this.location });
			}
		}
	}
}
</script>

<template>
	<AppButton
		v-if="shouldShow"
		v-app-auth-required
		v-app-tooltip.bottom="tooltip"
		class="user-follow-widget"
		primary
		:icon="icon"
		:circle="circle"
		:overlay="overlay"
		:block="block"
		:sm="sm"
		:solid="user.is_following"
		:badge="badge"
		:disabled="disabled"
		@click.stop="onClick"
	>
		<template v-if="!circle">
			<template v-if="!user.is_following">
				<AppTranslate>Follow</AppTranslate>
			</template>
			<template v-else>
				<AppTranslate>Following</AppTranslate>
			</template>
		</template>
	</AppButton>
</template>
