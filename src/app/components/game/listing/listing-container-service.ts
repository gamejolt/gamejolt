import { RouteLocationNormalized } from 'vue-router';
import { Game } from '../../../../_common/game/game.model';

export class GameListingContainer {
	isBootstrapped = false;
	games: Game[] = [];
	gameIds: Record<number, true> = {};
	gamesCount = 0;
	perPage = 10;
	currentPage = 1;
	section = 'featured';
	isLoadingMore = false;
	reachedEnd = false;

	processPayload(route: RouteLocationNormalized, payload: any) {
		this.isBootstrapped = true;
		this.addGames(Game.populate(payload.games));
		this.gamesCount = payload.gamesCount;
		this.perPage = payload.perPage;

		this.currentPage = route.query.page ? parseInt(route.query.page + '', 10) : 1;
		this.section = (route.params.section as string) ?? 'featured';
	}

	processPagePayload(page: number, payload: any) {
		const addedGames = this.addGames(Game.populate(payload.games));

		if (!addedGames.length) {
			this.reachedEnd = true;
			return;
		}

		this.gamesCount = payload.gamesCount;
		this.currentPage = page;
	}

	private addGames(newGames: Game[]) {
		const addedGames: Game[] = [];

		for (const game of newGames) {
			// Only add each game once, in case of dupes.
			if (this.gameIds[game.id]) {
				continue;
			}

			this.gameIds[game.id] = true;
			this.games.push(game);
			addedGames.push(game);
		}

		return addedGames;
	}
}
