import { AppTrackEvent } from '../../../../_common/analytics/track-event.directive';
import { AppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import { Game } from '../../../../_common/game/game.model';
import AppPopper from '../../../../_common/popper/popper.vue';
import { AppTooltip } from '../../../../_common/tooltip/tooltip';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../store/index';
import AppGamePlaylistAddToPopover from '../add-to-popover/add-to-popover.vue';

@Component({
	components: {
		AppPopper,
		AppGamePlaylistAddToPopover,
	},
	directives: {
		AppAuthRequired,
		AppTrackEvent,
		AppTooltip,
	},
})
export default class AppGamePlaylistAddToWidget extends Vue {
	@Prop(Game)
	game!: Game;

	@Prop(String)
	eventLabel?: string;

	@Prop(Boolean)
	overlay?: boolean;

	@Prop(Boolean)
	circle?: boolean;

	@State
	app!: Store['app'];

	isShown = false;

	readonly Game = Game;
}
