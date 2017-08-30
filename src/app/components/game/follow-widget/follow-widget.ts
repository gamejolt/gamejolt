import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./follow-widget.html';

import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppAuthRequired } from '../../../../lib/gj-lib-client/components/auth/auth-required-directive.vue';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { Store } from '../../../store/index';

@View
@Component({
	components: {
		AppJolticon,
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

	@State app: Store['app'];

	followTooltip: string;
	isProcessing = false;

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
