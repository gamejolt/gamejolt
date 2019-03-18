import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import AppGameThumbnailImg from 'game-jolt-frontend-lib/components/game/thumbnail-img/thumbnail-img.vue';
import AppUserCardHover from 'game-jolt-frontend-lib/components/user/card/hover/hover.vue';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({
	components: {
		AppGameThumbnailImg,
		AppUserCardHover,
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
