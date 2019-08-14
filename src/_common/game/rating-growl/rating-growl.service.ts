import { Api } from '../../api/api.service';
import { Growls } from '../../growls/growls.service';
import { appStore } from '../../store/app-store';
import { Game } from '../game.model';
import AppGameRatingGrowl from './rating-growl.vue';

export class GameRatingGrowl {
	static async show(game: Game) {
		// Don't show when not logged in.
		if (!appStore.state.user) {
			return;
		}

		// Don't show if ratings are disabled for the game.
		if (!game.ratings_enabled) {
			return;
		}

		// Don't show when this is the developer of the game.
		if (game.hasPerms()) {
			return;
		}

		const payload = await Api.sendRequest(
			'/web/discover/games/ratings/get-user-rating/' + game.id,
			null,
			{ detach: true }
		);

		// If there is a rating for this user already, don't show the growl.
		if (payload.rating) {
			return;
		}

		Growls.info({
			sticky: true,
			component: AppGameRatingGrowl,
			props: { game },
		});
	}
}
