import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./follow-widget.html';

import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppAuthRequired } from '../../../../lib/gj-lib-client/components/auth/auth-required-directive.vue';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { Store } from '../../../store/index';
import { AppUserFollowWidget } from '../../../../lib/gj-lib-client/components/user/follow-widget/follow-widget';
import { AppPopover } from '../../../../lib/gj-lib-client/components/popover/popover';
import { Popover } from '../../../../lib/gj-lib-client/components/popover/popover.service';

@View
@Component({
	components: {
		AppJolticon,
		AppUserFollowWidget,
		AppPopover,
	},
	directives: {
		AppAuthRequired,
		AppTrackEvent,
		AppTooltip,
	},
	filters: {
		number,
	},
})
export class AppGameFollowWidget extends Vue {
	@Prop(Game) game: Game;
	@Prop(Boolean) sparse?: boolean;
	@Prop(Boolean) outline?: boolean;
	@Prop(String) eventLabel?: string;
	@Prop(Boolean) showUserFollow?: boolean;

	@State app: Store['app'];

	isProcessing = false;

	get shouldShowFollow() {
		return this.showUserFollow && (!this.app.user || this.app.user.id !== this.game.developer.id);
	}

	get widgetId() {
		return `game-follow-widget-${this.game.id}`;
	}

	get popoverId() {
		return `game-follow-widget-user-follow-${this.game.id}`;
	}

	get btnClasses() {
		let classes: string[] = [];

		if (this.sparse) {
			classes.push('btn-sparse');
		}

		if (this.game.is_following) {
			classes.push('btn-success active');
		} else {
			if (this.outline) {
				classes.push('btn-success-outline');
			}
		}

		return classes;
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
				Growls.error(this.$gettext('Something has prevented you from following this game.'));
			}

			if (this.showUserFollow && !this.game.developer.is_following) {
				const popover = Popover.getPopover(this.popoverId);
				if (popover) {
					await this.$nextTick();
					popover.show(this.$el);
				}
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
