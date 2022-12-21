import { Model } from '../../model/model.service';

export class UserTipaltiManagedAccount extends Model {
	onboarding_status!: string;

	constructor(data: any = {}) {
		super(data);
	}
}

Model.create(UserTipaltiManagedAccount);
