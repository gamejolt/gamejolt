import { Options, Prop, Vue } from 'vue-property-decorator';
import { Game } from '../../../../_common/game/game.model';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/backdrop.vue';
import { AppTheme } from '../../../../_common/theme/theme';
import AppGameFollowWidget from '../follow-widget/follow-widget.vue';

@Options({
	components: {
		AppTheme,
		AppMediaItemBackdrop,
		AppGameFollowWidget,
	},
})
export default class AppGameBadge extends Vue {
	@Prop({ type: Object, required: true }) game!: Game;
	@Prop({ type: Boolean, default: false }) fullBleed!: boolean;
}
