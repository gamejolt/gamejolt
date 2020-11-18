import { Model } from '../../model/model.service';

export class UserTimeout extends Model {
	expires_on!: number;
	reason!: string;

	get isExpired() {
		return this.expires_on <= Date.now();
	}
}

Model.create(UserTimeout);
