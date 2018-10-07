import View from '!view!./follow-widget.html';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppAuthRequired } from '../../../../lib/gj-lib-client/components/auth/auth-required-directive.vue';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { AppPopper } from '../../../../lib/gj-lib-client/components/popper/popper';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppUserFollowWidget } from '../../../../lib/gj-lib-client/components/user/follow-widget/follow-widget';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { Store } from '../../../store/index';

@View
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
export class AppGameFollowWidget extends Vue {
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

	isProcessing = false;
	isShowingFollowPopover = false;

	get shouldShowFollow() {
		return (
			this.showUserFollow && (!this.app.user || this.app.user.id !== this.game.developer.id)
		);
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
		if (!this.app.user || this.isProcessing) {
			return;
		}

		this.isProcessing = true;

		if (!this.game.is_following) {
			try {
				await this.game.$follow();
			} catch (e) {
				Growls.error(
					this.$gettext('Something has prevented you from following this game.')
				);
			}

			if (this.shouldShowFollow && !this.game.developer.is_following) {
				this.isShowingFollowPopover = true;
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

		this.isProcessing = false;
	}
}
