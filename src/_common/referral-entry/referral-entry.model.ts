import { Model } from '../model/model.service';

export class ReferralEntryModel extends Model {
	declare user_id: number;
	declare referral_key: string;

	constructor(data?: any) {
		super(data);
	}
}
