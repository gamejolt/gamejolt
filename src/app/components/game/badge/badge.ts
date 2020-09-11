import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { Game } from '../../../../_common/game/game.model';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/backdrop.vue';
import { AppTheme } from '../../../../_common/theme/theme';
import AppGameFollowWidget from '../follow-widget/follow-widget.vue';

@Component({
	components: {
		AppTheme,
		AppMediaItemBackdrop,
		AppGameFollowWidget,
	},
})
export default class AppGameBadge extends Vue {
	@Prop(propRequired(Game)) game!: Game;
}
