import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive';
import { AppAuthRequired } from 'game-jolt-frontend-lib/components/auth/auth-required-directive';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import AppPopper from 'game-jolt-frontend-lib/components/popper/popper.vue';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
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
