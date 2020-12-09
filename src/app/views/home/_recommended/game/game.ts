import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import { Game } from '../../../../../_common/game/game.model';
import AppGameThumbnailPlaceholder from '../../../../../_common/game/thumbnail/placeholder/placeholder.vue';
import AppGameThumbnail from '../../../../../_common/game/thumbnail/thumbnail.vue';

@Component({
	components: {
		AppGameThumbnail,
		AppGameThumbnailPlaceholder,
	},
})
export default class AppHomeRecommendedGame extends Vue {
	@Prop(propOptional(Game, null)) game!: Game | null;
	@Prop(propRequired(Boolean)) loading!: boolean;
}
