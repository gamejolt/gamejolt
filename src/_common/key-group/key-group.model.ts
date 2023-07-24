import { GamePackage } from '../game/package/package.model';
import { Model, defineLegacyModel } from '../model/model.service';

export const enum KeyGroupType {
	Order = 'order',
	Anonymous = 'anonymous',
	AnonymousClaim = 'anonymous-claim',
	Email = 'email',
	User = 'user',
}

export class KeyGroup extends defineLegacyModel(
	class KeyGroupDefinition extends Model {
		declare game_id: number;
		declare type: string;
		declare name: string;

		// Packages settings
		packages: GamePackage[] = [];

		// Counts settings
		declare key_count?: number;
		declare viewed_count?: number;
		declare claimed_count?: number;

		// Used for forms and saving.
		package_ids: number[] = [];

		constructor(data: any = {}) {
			super(data);

			if (data.packages) {
				this.packages = GamePackage.populate(data.packages);
				this.package_ids = this.packages.map(i => i.id);
			}
		}

		$save() {
			const data: any = Object.assign({}, this);
			data.packages = {};
			for (const id of this.package_ids) {
				data.packages[id] = true;
			}

			const options = {
				allowComplexData: ['packages'],
				data,
			};

			if (this.id) {
				return this.$_save(
					'/web/dash/developer/games/key-groups/save/' + this.game_id + '/' + this.id,
					'keyGroup',
					options
				);
			}

			return this.$_save(
				'/web/dash/developer/games/key-groups/save/' + this.game_id,
				'keyGroup',
				options
			);
		}

		$remove() {
			return this.$_remove(
				'/web/dash/developer/games/key-groups/remove/' + this.game_id + '/' + this.id
			);
		}
	}
) {}
