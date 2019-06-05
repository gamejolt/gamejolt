import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive';
import { AppAuthRequired } from 'game-jolt-frontend-lib/components/auth/auth-required-directive';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import AppPopper from 'game-jolt-frontend-lib/components/popper/popper.vue';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { UserFollowSuggestion } from 'game-jolt-frontend-lib/components/user/follow/suggestion.service';
import AppUserFollowWidget from 'game-jolt-frontend-lib/components/user/follow/widget.vue';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../store/index';

@Component({
	components: {
		AppUserFollowWidget,
		AppPopper,
	},
	directives: {
		AppAuthRequired,
		AppTrackEvent,
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

	@Prop(String)
	eventLabel?: string;

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
					// tslint:disable-next-line:indent
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
		if (!this.game.developer.is_following) {
			UserFollowSuggestion.doNotSuggest(this.game.developer.id);
		}
	}
}
