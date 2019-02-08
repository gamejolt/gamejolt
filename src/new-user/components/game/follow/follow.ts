import View from '!view!./follow.html?style=./follow.styl';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { AppGameThumbnailImg } from 'game-jolt-frontend-lib/components/game/thumbnail-img/thumbnail-img';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppGameFollowWidget } from '../../../../app/components/game/follow-widget/follow-widget';

@View
@Component({
	components: {
		AppGameThumbnailImg,
		AppGameFollowWidget,
	},
})
export default class AppGameFollow extends Vue {
	@Prop(Game)
	game!: Game;

	get gameUrl() {
		return this.game.getUrl();
	}

	get developerUrl() {
		return this.game.developer.url;
	}

	get followerCount() {
		let count = this.game.follower_count;
		if (!count) {
			count = 0;
		}

		return this.$gettextInterpolate('%{ count } followers', {
			count: count.toString(),
		});
	}
}
