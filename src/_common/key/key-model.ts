import { Model } from '../model/model.service';

export class Key extends Model {
	key_group_id!: number;
	resource!: string;
	resource_id!: number;
	user_id?: number;
	email?: string;
	key!: string;
	claimed!: boolean;
	viewed_on!: number;
	claimed_on?: number;
	username?: string;

	constructor(data: any = {}) {
		super(data);
	}

	$remove() {
		return this.$_remove('/web/dash/developer/games/keys/remove/' + this.id);
	}
}

Model.create(Key);
