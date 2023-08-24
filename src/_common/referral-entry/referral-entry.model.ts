import { Model } from '../model/model.service';

export class ReferralEntryModel extends Model {
	user_id!: number;
	referral_key!: string;

	constructor(data?: any) {
		super(data);
	}
}
