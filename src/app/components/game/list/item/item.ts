import View from '!view!./item.html?style=./item.styl';
import { AppUserCardHover } from 'game-jolt-frontend-lib/components/user/card/hover/hover';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppTrackEvent } from '../../../../../lib/gj-lib-client/components/analytics/track-event.directive';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { AppGameThumbnailImg } from '../../../../../lib/gj-lib-client/components/game/thumbnail-img/thumbnail-img';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';

@View
@Component({
	components: {
		AppGameThumbnailImg,
		AppUserCardHover,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppGameListItem extends Vue {
	@Prop(Game)
	game!: Game;

	@Prop(String)
	eventLabel?: string;

	number = number;

	get url() {
		return this.game.getUrl();
	}
}
