import Dexie from 'dexie';
import { LocalDbGame } from './game/game.model';
import { LocalDbPackage } from './package/package.model';
import { LocalDbModel } from './model.service';

function setHooks<T extends LocalDbModel>(table: Dexie.Table<T, number>) {
	table.hook('reading', obj => {
		obj.hydrate();
		return obj;
	});
}

export class LocalDb extends Dexie {
	games: Dexie.Table<LocalDbGame, number>;
	packages: Dexie.Table<LocalDbPackage, number>;

	constructor() {
		super('local');

		this.version(1).stores({
			games: 'id',
			packages: 'id,game_id',
		});

		this.version(2)
			.stores({
				games: 'id',
				packages: 'id,game_id',
			})
			.upgrade(trans => {
				return trans
					.table('games')
					.toCollection()
					.modify(game => {
						game.modified_on = 0;
					});
			});

		this.games.mapToClass(LocalDbGame);
		this.packages.mapToClass(LocalDbPackage);

		setHooks(this.games);
		setHooks(this.packages);

		this.open();
	}
}

export const db = new LocalDb();
