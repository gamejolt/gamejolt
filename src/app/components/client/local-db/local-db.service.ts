import { Collection } from './collection';
import { LocalDbGame } from './game/game.model';
import { LocalDbPackage } from './package/package.model';

const path = require('path') as typeof import('path');

export class LocalDb {
	readonly games: Collection<LocalDbGame>;
	readonly packages: Collection<LocalDbPackage>;

	private static _instance: Promise<LocalDb> | null = null;

	private constructor() {
		const dataPath = nw.App.dataPath;

		this.games = new Collection<LocalDbGame>(1, path.join(dataPath, 'games.wttf'), LocalDbGame);
		this.packages = new Collection<LocalDbPackage>(
			1,
			path.join(dataPath, 'packages.wttf'),
			LocalDbPackage
		);
		this.packages.defineGroup('game_id');
	}

	static instance() {
		if (!this._instance) {
			console.log('new localdb');
			const db = new LocalDb();
			this._instance = Promise.all([db.games.load(), db.packages.load()]).then(() => db);
		}

		return this._instance;
	}
}
