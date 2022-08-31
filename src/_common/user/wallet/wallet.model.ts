import { Model } from '../../model/model.service';

export class UserWallet extends Model {
	constructor(data: any = {}) {
		super(data);
	}

	declare available_balance: number;
	declare pending_balance: number;
	declare minimum_payout_balance: number;
	declare can_withdraw: boolean;
}

Model.create(UserWallet);
