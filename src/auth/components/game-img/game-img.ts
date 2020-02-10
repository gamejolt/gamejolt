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
		return this.$store.state.coverGame.title;
	}

	get developerName() {
		return this.$store.state.coverGame.developer.display_name;
	}

	get gameUrl() {
		return 'https://gamejolt.com/games/0/' + this.$store.state.coverGame.compatibility.game_id;
	}
}
