import { Dexie } from 'dexie';
import { LocalDbGame } from './game/game.model';
import { LocalDbPackage } from './package/package.model';

class LocalDb extends Dexie
{
	games: Dexie.Table<LocalDbGame, number>;
	packages: Dexie.Table<LocalDbPackage, number>;

	constructor()
	{
		super( 'local' );

		this.version( 1 ).stores( {
			'games': 'id',
			'packages': 'id,game_id',
		} );

		this.games.mapToClass( LocalDbGame );
		this.packages.mapToClass( LocalDbPackage );

		this.open();
	}
}

export const db = new LocalDb();
