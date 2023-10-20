import { RouteLocationNormalized } from 'vue-router';
import { GameModel } from '../../../../_common/game/game.model';

export class GameListingContainer {
	constructor({
		loadInfinitely = true,
	}: {
		loadInfinitely?: boolean;
	} = {}) {
		this.loadInfinitely = loadInfinitely;
	}

	/**
	 * Whether or not this listing container should load games in infinitely as
	 * you scroll.
	 */
	readonly loadInfinitely: boolean;

	isBootstrapped = false;
	games: GameModel[] = [];
	gameIds = new Set<number>();
	gamesCount = 0;
	perPage = 10;
	currentPage = 1;
	section = 'featured';
	isLoadingMore = false;
	reachedEnd = false;

	processPayload(route: RouteLocationNormalized, payload: any) {
		this.isBootstrapped = true;
		this.gamesCount = payload.gamesCount;
		this.perPage = payload.perPage;

		this.resetGames();
		this.addGames(GameModel.populate(payload.games));

		this.currentPage = route.query.page ? parseInt(route.query.page + '', 10) : 1;
		this.section = (route.params.section as string) ?? 'featured';
	}

	processPagePayload(page: number, payload: any) {
		if (!this.loadInfinitely) {
			this.resetGames();
		}

		const addedGames = this.addGames(GameModel.populate(payload.games));

		if (!addedGames.length) {
			this.reachedEnd = true;
			return;
		}

		this.gamesCount = payload.gamesCount;
		this.currentPage = page;
	}

	private resetGames() {
		this.games = [];
		this.gameIds = new Set();
	}

	private addGames(newGames: GameModel[]) {
		const addedGames: GameModel[] = [];

		for (const game of newGames) {
			// Only add each game once, in case of dupes.
			if (this.gameIds.has(game.id)) {
				continue;
			}

			this.gameIds.add(game.id);
			this.games.push(game);
			addedGames.push(game);
		}

		return addedGames;
	}

	public setGames(games: GameModel[]) {
		this.resetGames();
		this.addGames(games);
	}
}
