import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./add-to-widget.html';

import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { AppAuthRequired } from '../../../../lib/gj-lib-client/components/auth/auth-required-directive.vue';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { Store } from '../../../store/index';
import { AppPopoverTrigger } from '../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppGamePlaylistAddToPopover } from '../add-to-popover/add-to-popover';

@View
@Component({
	components: {
		AppGamePlaylistAddToPopover,
	},
	directives: {
		AppAuthRequired,
		AppPopoverTrigger,
		AppTrackEvent,
		AppTooltip,
	},
})
export class AppGamePlaylistAddToWidget extends Vue {
	@Prop(Game) game: Game;
	@Prop(String) eventLabel?: string;
	@Prop(Boolean) overlay?: boolean;
	@Prop(Boolean) circle?: boolean;

	@State app: Store['app'];

	Game = Game;
}
