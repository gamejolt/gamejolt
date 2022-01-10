import { Options, Prop, Vue } from 'vue-property-decorator';
import { Game } from '../../../../_common/game/game.model';
import AppThemeSvg from '../../../../_common/theme/svg/AppThemeSvg.vue';

@Options({
	components: {
		AppThemeSvg,
	},
})
export default class AppGameOgrsTag extends Vue {
	@Prop(Game) game!: Game;
	@Prop(Boolean) full?: boolean;

	readonly assetPaths = import.meta.globEager('./*.svg');

	get imgTag() {
		if (this.game) {
			if (this.game.tigrs_age === 1) {
				return 'all-ages';
			} else if (this.game.tigrs_age === 2) {
				return 'teen';
			} else if (this.game.tigrs_age === 3) {
				return 'mature';
			}
		}

		return '';
	}

	get imgUrl() {
		return this.assetPaths[`./${this.imgTag}.svg`].default;
	}

	get imgTagUrl() {
		return this.assetPaths[`./${this.imgTag}-tag.svg`].default;
	}

	get imgTagHeight() {
		if (this.full) {
			return 100;
		}

		return 16;
	}
}
