import View from '!view!./preview.html?style=./preview.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { AppGameThumbnailImg } from '../../../../lib/gj-lib-client/components/game/thumbnail-img/thumbnail-img';
import { AppUserAvatar } from '../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';

@View
@Component({
	components: {
		AppGameThumbnailImg,
		AppUserAvatar,
	},
})
export default class AppGamePreview extends Vue {
	@Prop(Game)
	game!: Game;

	get isActive() {
		return this.game.is_following;
	}

	get developerTag() {
		return this.game.developer.display_name + ' (@' + this.game.developer.username + ')';
	}

	onClick() {
		if (!this.game.is_following) {
			this.game.$follow();
		} else {
			this.game.$unfollow();
		}
	}
}
