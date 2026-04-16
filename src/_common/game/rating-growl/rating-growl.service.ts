import { Api } from '~common/api/api.service';
import { GameModel } from '~common/game/game.model';
import AppGameRatingGrowl from '~common/game/rating-growl/AppGameRatingGrowl.vue';
import { showInfoGrowl } from '~common/growls/growls.service';
import { commonStore } from '~common/store/common-store';

export async function showGameRatingGrowl(game: GameModel) {
	// Don't show when not logged in.
	if (!commonStore.user.value) {
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

	showInfoGrowl({
		sticky: true,
		component: AppGameRatingGrowl,
		props: { game },
	});
}
