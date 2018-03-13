import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./item.html?style=./item.styl';

import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { AppGameThumbnailImg } from '../../../../../lib/gj-lib-client/components/game/thumbnail-img/thumbnail-img';
import { AppTrackEvent } from '../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';

@View
@Component({
	components: {
		AppGameThumbnailImg,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppGameListItem extends Vue {
	@Prop(Game) game: Game;
	@Prop(String) eventLabel?: string;

	get url() {
		return this.game.getUrl();
	}
}
