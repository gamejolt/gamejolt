import { Model } from '../../model/model.service';
import { BaseTrophy } from '../../trophy/base-trophy.model';
import { User } from '../user.model';

export abstract class UserBaseTrophy extends Model {
	user_id!: number;
	logged_on!: number;
	viewed_on?: number;

	user?: User;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}
	}

	abstract get trophy(): BaseTrophy | undefined;
	abstract get key(): string;

	abstract $view(): void;
}
