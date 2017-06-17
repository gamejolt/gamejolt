import { LocalDbPackage } from '../local-db/package/package.model';
import { LocalDbGame } from '../local-db/game/game.model';
import { db } from '../local-db/local-db.service';
import { State, namespace, Action, Mutation, Getter } from 'vuex-class';
import {
	VuexModule,
	VuexStore,
	VuexAction,
	VuexMutation,
} from '../../../../lib/gj-lib-client/utils/vuex';

export const ClientLibraryState = namespace('library', State);
export const ClientLibraryAction = namespace('library', Action);
export const ClientLibraryMutation = namespace('library', Mutation);
export const ClientLibraryGetter = namespace('library', Getter);

export type Actions = {
	'client-library/loadLocalDb': undefined;
};

export type Mutations = {
	'client-library/bootstrapLocalDb': {
		packages: LocalDbPackage[];
		games: LocalDbGame[];
	};
};

@VuexModule()
export class ClientLibraryStore extends VuexStore<
	ClientLibraryStore,
	Actions,
	Mutations
> {
	packages: LocalDbPackage[] = [];
	games: LocalDbGame[] = [];

	@VuexAction
	async loadLocalDb() {
		const [packages, games] = await Promise.all([
			db.packages.toArray(),
			db.games.toArray(),
		]);
		this.bootstrapLocalDb({ packages, games });
	}

	@VuexMutation
	bootstrapLocalDb({
		packages,
		games,
	}: Mutations['client-library/bootstrapLocalDb']) {
		this.packages = packages;
		this.games = games;
	}

	get packagesById() {
		return this.packages.reduce<{
			[packageId: number]: LocalDbPackage;
		}>((accum, _package) => {
			accum[_package.id] = _package;
			return accum;
		}, {});
	}

	get gamesById() {
		return this.games.reduce<{
			[gameId: number]: LocalDbGame;
		}>((accum, game) => {
			accum[game.id] = game;
			return accum;
		}, {});
	}

	get packagesByGameId() {
		return this.packages.reduce<{
			[gameId: number]: LocalDbPackage[];
		}>((accum, _package) => {
			if (!accum[_package.game_id]) {
				accum[_package.game_id] = [];
			}
			accum[_package.game_id].push(_package);
			return accum;
		}, {});
	}
}
