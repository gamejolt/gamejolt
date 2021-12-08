import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../../../_common/filters/number';
import { Game } from '../../../../../_common/game/game.model';
import AppGameThumbnailImg from '../../../../../_common/game/thumbnail-img/thumbnail-img.vue';
import AppUserCardHover from '../../../../../_common/user/card/hover/hover.vue';
import AppUserVerifiedTick from '../../../../../_common/user/verified-tick/verified-tick.vue';

@Options({
	components: {
		AppGameThumbnailImg,
		AppUserCardHover,
		AppUserVerifiedTick,
	},
})
export default class AppGameListItem extends Vue {
	@Prop(Game)
	game!: Game;

	@Prop(String)
	eventLabel?: string;

	formatNumber = formatNumber;

	get url() {
		return this.game.getUrl();
	}
}
