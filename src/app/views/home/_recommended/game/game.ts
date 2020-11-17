import Vue from 'vue';
import Component from 'vue-class-component';
import { Api } from '../../../../../_common/api/api.service';
import { Game } from '../../../../../_common/game/game.model';
import AppGameThumbnailPlaceholder from '../../../../../_common/game/thumbnail/placeholder/placeholder.vue';
import AppGameThumbnail from '../../../../../_common/game/thumbnail/thumbnail.vue';

@Component({
	components: {
		AppGameThumbnail,
		AppGameThumbnailPlaceholder,
	},
})
export default class AppHomeRecommendedGame extends Vue {
	game: Game | null = null;
	isLoading = true;

	async mounted() {
		const payload = await Api.sendRequest('/web/dash/recommended/featured');
		if (payload.featuredGame) {
			this.game = new Game(payload.featuredGame);
		}

		this.isLoading = false;
	}
}
