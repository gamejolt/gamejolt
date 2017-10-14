import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./item.html?style=./item.styl';

import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { AppGameThumbnailImg } from '../../../../../lib/gj-lib-client/components/game/thumbnail-img/thumbnail-img';

@View
@Component({
	components: {
		AppGameThumbnailImg,
	},
})
export class AppGameListItem extends Vue {
	@Prop(Game) game: Game;

	get url() {
		return this.game.getUrl();
	}
}
