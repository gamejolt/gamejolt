<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { GameFollowLocation, trackGameFollow } from '../../analytics/analytics.service';
import { vAppAuthRequired } from '../../auth/auth-required-directive';
import { formatNumber } from '../../filters/number';
import { showErrorGrowl } from '../../growls/growls.service';
import { ModalConfirm } from '../../modal/confirm/confirm-service';
import AppPopper from '../../popper/AppPopper.vue';
import { useCommonStore } from '../../store/common-store';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import AppUserFollowButton from '../../user/follow/AppUserFollowButton.vue';
import { UserFollowSuggestion } from '../../user/follow/suggestion.service';
import { followGame, Game, unfollowGame } from '../game.model';

@Options({
	components: {
		AppUserFollowButton,
		AppPopper,
	},
	directives: {
		AppAuthRequired: vAppAuthRequired,
		AppTooltip: vAppTooltip,
	},
})
export default class AppGameFollowWidget extends Vue {
	@Prop({ type: Object, required: true })
	game!: Game;

	@Prop({ type: String, required: true })
	location!: GameFollowLocation;

	@Prop({ type: Boolean, required: false, default: false })
	overlay!: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	circle!: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	block!: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	lg!: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	solid!: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	showUserFollow!: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	hideCount!: boolean;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	isShowingFollowPopover = false;

	get shouldShowFollow() {
		if (!this.showUserFollow) {
			return false;
		}

		if (
			(this.app.user && this.app.user.id === this.game.developer.id) ||
			this.game.developer.is_following
		) {
			return false;
		}

		return true;
	}

	get widgetId() {
		return `game-follow-widget-${this.game.id}`;
	}

	get badge() {
		return !this.circle && !this.hideCount && this.game.follower_count
			? formatNumber(this.game.follower_count)
			: '';
	}

	get tooltip() {
		return !this.game.is_following
			? this.$gettext(
					`Follow this game to add it to your Library and be notified when new posts are added.`
					// eslint-disable-next-line no-mixed-spaces-and-tabs
			  )
			: undefined;
	}

	get icon() {
		if (!this.circle) {
			return '';
		}

		return !this.game.is_following ? 'subscribe' : 'subscribed';
	}

	async onClick() {
		if (!this.app.user) {
			return;
		}

		let failed = false;
		if (!this.game.is_following) {
			// Do this before attempting to follow.
			// We don't want to wait till the follow is confirmed to show the dialog,
			// and even if the follow fails it's not like we'll close it.
			// The user follow suggestion is not reactive, so we call it on impulse like this
			// instead of putting it in the shouldShowFollow getter.
			if (this.shouldShowFollow && UserFollowSuggestion.canSuggest(this.game.developer.id)) {
				this.isShowingFollowPopover = true;
			}

			try {
				await followGame(this.game);
			} catch (e) {
				failed = true;
				showErrorGrowl(
					this.$gettext('Something has prevented you from following this game.')
				);
			} finally {
				trackGameFollow(true, { failed, location: this.location });
			}
		} else {
			if (this.isShowingFollowPopover) {
				this.onFollowPopoverDismissed();
			}

			const result = await ModalConfirm.show(
				this.$gettext(`Are you sure you want to unfollow this game?`),
				this.$gettext(`Unfollow game?`)
			);

			if (!result) {
				return;
			}

			try {
				await unfollowGame(this.game);
			} catch (e) {
				failed = true;
				showErrorGrowl(
					this.$gettext('Uh-oh, something has prevented you from unfollowing this game.'),
					this.$gettext('Oh no!')
				);
			} finally {
				trackGameFollow(false, { failed, location: this.location });
			}
		}
	}

	onFollowPopoverDismissed() {
		this.isShowingFollowPopover = false;

		if (!this.game.developer.is_following) {
			UserFollowSuggestion.doNotSuggest(this.game.developer.id);
		}
	}
}
</script>

<template>
	<AppPopper
		class="game-follow-widget"
		popover-class="fill-darkest"
		trigger="manual"
		track-trigger-width
		:manual-show="isShowingFollowPopover"
		:block="block"
		@click-away="onFollowPopoverDismissed"
	>
		<AppButton
			:id="widgetId"
			v-app-auth-required
			v-app-tooltip="tooltip"
			primary
			:icon="icon"
			:circle="circle"
			:overlay="overlay"
			:block="block"
			:lg="lg"
			:solid="game.is_following || solid"
			:badge="badge"
			@click="onClick"
		>
			<template v-if="!circle">
				<template v-if="!game.is_following">
					<AppTranslate>Follow</AppTranslate>
				</template>
				<template v-else>
					<AppTranslate>Following</AppTranslate>
				</template>
			</template>
		</AppButton>

		<template #popover>
			<div class="well">
				<p class="small">
					<AppTranslate>
						Would you also like to follow this developer? You will get notified when
						they release new games.
					</AppTranslate>
				</p>
				<AppUserFollowButton :user="game.developer" block location="gameFollow" />
			</div>
		</template>
	</AppPopper>
</template>
