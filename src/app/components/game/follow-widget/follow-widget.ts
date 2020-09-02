import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { AppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import { number } from '../../../../_common/filters/number';
import { Game } from '../../../../_common/game/game.model';
import { Growls } from '../../../../_common/growls/growls.service';
import AppPopper from '../../../../_common/popper/popper.vue';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { UserFollowSuggestion } from '../../../../_common/user/follow/suggestion.service';
import AppUserFollowWidget from '../../../../_common/user/follow/widget.vue';
import { Store } from '../../../store/index';

@Component({
	components: {
		AppUserFollowWidget,
		AppPopper,
	},
	directives: {
		AppAuthRequired,
		AppTooltip,
	},
})
export default class AppGameFollowWidget extends Vue {
	@Prop(Game)
	game!: Game;

	@Prop(Boolean)
	overlay?: boolean;

	@Prop(Boolean)
	circle?: boolean;

	@Prop(Boolean)
	block?: boolean;

	@Prop(Boolean)
	lg?: boolean;

	@Prop(Boolean)
	solid?: boolean;

	@Prop({ type: String, required: false, default: 'global' })
	eventLabel!: string;

	@Prop(Boolean)
	showUserFollow?: boolean;

	@State
	app!: Store['app'];

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
		return !this.circle && this.game.follower_count ? number(this.game.follower_count) : '';
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
				await this.game.$follow();
			} catch (e) {
				Growls.error(
					this.$gettext('Something has prevented you from following this game.')
				);
			}
		} else {
			if (this.isShowingFollowPopover) {
				this.onFollowPopoverDismissed();
			}

			try {
				await this.game.$unfollow();
			} catch (e) {
				Growls.error(
					this.$gettext('library.followed.remove_game_error_growl'),
					this.$gettext('library.followed.remove_game_error_growl_title')
				);
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
