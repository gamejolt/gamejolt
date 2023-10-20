import { GamePackageModel } from '../game/package/package.model';
import { Model } from '../model/model.service';

export const enum KeyGroupType {
	Order = 'order',
	Anonymous = 'anonymous',
	AnonymousClaim = 'anonymous-claim',
	Email = 'email',
	User = 'user',
}

export class KeyGroupModel extends Model {
	declare game_id: number;
	declare type: string;
	declare name: string;

	// Packages settings
	packages: GamePackageModel[] = [];

	// Counts settings
	declare key_count?: number;
	declare viewed_count?: number;
	declare claimed_count?: number;

	// Used for forms and saving.
	package_ids: number[] = [];

	constructor(data: any = {}) {
		super(data);

		if (data.packages) {
			this.packages = GamePackageModel.populate(data.packages);
			this.package_ids = this.packages.map(i => i.id);
		}
	}
}

export function $saveKeyGroup(model: KeyGroupModel) {
	const data: any = Object.assign({}, model);
	data.packages = {};
	for (const id of model.package_ids) {
		data.packages[id] = true;
	}

	const options = {
		allowComplexData: ['packages'],
		data,
	};

	if (model.id) {
		return model.$_save(
			'/web/dash/developer/games/key-groups/save/' + model.game_id + '/' + model.id,
			'keyGroup',
			options
		);
	}

	return model.$_save(
		'/web/dash/developer/games/key-groups/save/' + model.game_id,
		'keyGroup',
		options
	);
}

export function $removeKeyGroup(model: KeyGroupModel) {
	return model.$_remove(
		'/web/dash/developer/games/key-groups/remove/' + model.game_id + '/' + model.id
	);
}
