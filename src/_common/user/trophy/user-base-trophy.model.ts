import { Model } from '../../model/model.service';
import { BaseTrophy } from '../../trophy/base-trophy.model';
import { User } from '../user.model';

export abstract class UserBaseTrophy extends Model {
	declare user_id: number;
	declare logged_on: number;
	declare viewed_on?: number;
	declare user?: User;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}
	}

	abstract get trophy(): BaseTrophy | undefined;
	abstract get key(): string; // Used to uniquely identify a user trophy.

	abstract $view(): void;
}
