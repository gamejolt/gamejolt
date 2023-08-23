import { Model } from '../../model/model.service';

export class UserTipaltiManagedAccount extends Model {
	onboarding_status!: 'temp' | 'in-progress' | 'active' | 'error' | 'rejected' | 'inactive';

	constructor(data: any = {}) {
		super(data);
	}
}
