import Dexie from 'dexie';
import { LocalDbGame } from './game/game.model';
import { LocalDbPackage } from './package/package.model';

export class LocalDb extends Dexie {
	games: Dexie.Table<LocalDbGame, number>;
	packages: Dexie.Table<LocalDbPackage, number>;

	constructor() {
		super('local');

		this.version(1).stores({
			games: 'id',
			packages: 'id,game_id',
		});

		this.games.mapToClass(LocalDbGame);
		this.packages.mapToClass(LocalDbPackage);

		// this.games.hook('reading', obj => {
		// 	obj.hydrate();
		// 	console.log('reading hook', obj);
		// 	return obj;
		// });

		this.open();
	}
}

export const db = new LocalDb();
