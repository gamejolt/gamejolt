import { Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../utils/vue';
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
	@Prop(propRequired(Object)) game!: Game;
	@Prop(propOptional(Boolean, false)) fullBleed!: boolean;
}
