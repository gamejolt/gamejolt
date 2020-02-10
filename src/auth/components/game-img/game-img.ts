import Vue from 'vue';
import Component from 'vue-class-component';
import { State } from 'vuex-class';
import AppGameThumbnailImg from '../../../_common/game/thumbnail-img/thumbnail-img.vue';
import { Store } from '../../store/index';

@Component({
	name: 'GameCoverCredits',
	components: {
		AppGameThumbnailImg,
	},
})
export default class GameCoverCredits extends Vue {
	@State coverGame: Store['coverGame'];

	get gameTitle() {
		return this.coverGame!.title;
	}

	get developerName() {
		return this.coverGame!.developer.display_name;
	}

	get gameUrl() {
		return `https://gamejolt.com/games/${this.coverGame!.path}/${
			this.coverGame!.compatibility.game_id
		}`;
	}

	get devUrl() {
		return `https://gamejolt.com${this.coverGame!.developer.url}`;
	}

	get gameFollows() {
		return this.coverGame!.follower_count;
	}
}
