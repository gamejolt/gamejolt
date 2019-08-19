import { AppTrackEvent } from '../../../../../_common/analytics/track-event.directive';
import { Game } from '../../../../../_common/game/game.model';
import AppGameThumbnailImg from '../../../../../_common/game/thumbnail-img/thumbnail-img.vue';
import AppUserCardHover from '../../../../../_common/user/card/hover/hover.vue';
import AppUserVerifiedTick from '../../../../../_common/user/verified-tick/verified-tick.vue';
import { number } from '../../../../../_common/filters/number';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({
	components: {
		AppGameThumbnailImg,
		AppUserCardHover,
		AppUserVerifiedTick,
	},
	directives: {
		AppTrackEvent,
	},
})
export default class AppGameListItem extends Vue {
	@Prop(Game)
	game!: Game;

	@Prop(String)
	eventLabel?: string;

	number = number;

	get url() {
		return this.game.getUrl();
	}
}
