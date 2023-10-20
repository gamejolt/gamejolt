import { Model } from '../model/model.service';

export class KeyModel extends Model {
	declare key_group_id: number;
	declare resource: string;
	declare resource_id: number;
	declare user_id?: number;
	declare email?: string;
	declare key: string;
	declare claimed: boolean;
	declare viewed_on: number;
	declare claimed_on?: number;
	declare username?: string;

	constructor(data: any = {}) {
		super(data);
	}
}

export function $removeKey(model: KeyModel) {
	return model.$_remove('/web/dash/developer/games/keys/remove/' + model.id);
}
