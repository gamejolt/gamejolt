import { Model } from '../../model/model.service';
import { BaseTrophyModel } from '../../trophy/base-trophy.model';
import { UserModel } from '../user.model';

export abstract class UserBaseTrophyModel extends Model {
	declare user_id: number;
	declare logged_on: number;
	declare viewed_on?: number;
	declare user?: UserModel;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new UserModel(data.user);
		}
	}

	abstract get trophy(): BaseTrophyModel | undefined;
	abstract get key(): string; // Used to uniquely identify a user trophy.

	abstract $view(): void;
}
