import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { AppThemeSvg } from 'game-jolt-frontend-lib/components/theme/svg/svg';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component({
	components: {
		AppThemeSvg,
	},
})
export default class AppGameOgrsTag extends Vue {
	@Prop(Game) game!: Game;
	@Prop(Boolean) full?: boolean;

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
		return require(`./${this.imgTag}.svg`);
	}

	get imgTagUrl() {
		return require(`./${this.imgTag}-tag.svg`);
	}

	get imgTagHeight() {
		if (this.full) {
			return 100;
		}

		return 16;
	}
}
