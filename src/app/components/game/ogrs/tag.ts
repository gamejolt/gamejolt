import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./tag.html?style=./tag.styl';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';

@View
@Component({})
export class AppGameOgrsTag extends Vue {
	@Prop(Game) game: Game;
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

	get imgTagUrl() {
		return require(`./${this.imgTag}${!this.full ? '-tag' : ''}.png`);
	}

	get imgTagHeight() {
		if (this.full) {
			return 100;
		}

		return 16;
	}
}
