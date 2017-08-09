import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./add-to-widget.html';

import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppAuthRequired } from '../../../../lib/gj-lib-client/components/auth/auth-required-directive.vue';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { Store } from '../../../store/index';
import { AppPopoverTrigger } from '../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppGamePlaylistAddToPopover } from '../add-to-popover/add-to-popover';

@View
@Component({
	components: {
		AppJolticon,
		AppGamePlaylistAddToPopover,
	},
	directives: {
		AppAuthRequired,
		AppPopoverTrigger,
		AppTrackEvent,
		AppTooltip,
	},
	filters: {
		number,
	},
})
export class AppGamePlaylistAddToWidget extends Vue {
	@Prop(Game) game: Game;
	@Prop(Boolean) outline?: boolean;

	@State app: Store['app'];

	Game = Game;
}
