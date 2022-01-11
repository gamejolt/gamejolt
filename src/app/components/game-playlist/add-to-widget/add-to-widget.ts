import { Options, Prop, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { AppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import { Game } from '../../../../_common/game/game.model';
import AppPopper from '../../../../_common/popper/popper.vue';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { Store } from '../../../store/index';
import AppGamePlaylistAddToPopover from '../add-to-popover/add-to-popover.vue';

@Options({
	components: {
		AppPopper,
		AppGamePlaylistAddToPopover,
	},
	directives: {
		AppAuthRequired,
		AppTooltip,
	},
})
export default class AppGamePlaylistAddToWidget extends Vue {
	@Prop(Object)
	game!: Game;

	@Prop({ type: String, required: false, default: 'global' })
	eventLabel!: string;

	@Prop(Boolean)
	overlay?: boolean;

	@Prop(Boolean)
	circle?: boolean;

	@State
	app!: Store['app'];

	isShown = false;

	readonly Game = Game;
}
