import View from '!view!./upgrade.html';
import { Component } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../lib/gj-lib-client/components/route/route-component';
import { AppJolticon } from '../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import * as path from 'path';
import * as nwGui from 'nw.gui';
import * as fs from 'fs';
import { db } from '../../../app/components/client/local-db/local-db.service';
import { LocalDbPackage } from '../../../app/components/client/local-db/package/package.model';
import { LocalDbGame } from '../../../app/components/client/local-db/game/game.model';
import { arrayIndexBy } from '../../../lib/gj-lib-client/utils/array';

@View
@Component({
	name: 'RouteUpgrade',
	components: {
		AppJolticon,
	},
})
export default class RouteUpgrade extends BaseRouteComponent {
	routeInit() {
		this.migrate();
	}

	async migrate() {
		console.log('migrating');
		// This is to ensure we can write the migration file before updating. We abort otherwise with an exception.
		const migrationFile = path.join(nwGui.App.dataPath, '0.12.3-migration.json');
		fs.writeFileSync(migrationFile, '');

		console.log('Saving indexeddb and localStorage...');
		const [packages, games] = await Promise.all([
			// Need these type hints because dexie returns its own Dexie.Promises.
			db.packages.toArray() as Promise<LocalDbPackage[]>,
			db.games.toArray() as Promise<LocalDbGame[]>,
		]);

		const indexeddbData = {
			games: arrayIndexBy(games, 'id'),
			packages: arrayIndexBy(packages, 'id'),
		};

		const migrationData = {
			indexeddb: indexeddbData,
			localStorage: localStorage,
		};

		fs.writeFileSync(migrationFile, JSON.stringify(migrationData), { encoding: 'utf8' });
	}
}
