import type { LocalDbGame } from '../../components/client/local-db/game/game.model';

export default class ClientLibraryGameDataMutations {
	constructor(
		readonly setGameData: (game: LocalDbGame, data: Partial<LocalDbGame>) => Promise<void>
	) {}
}
