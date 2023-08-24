import { Model } from '../../model/model.service';

export class UserWalletModel extends Model {
	constructor(data: any = {}) {
		super(data);
	}

	declare available_balance: number;
	declare pending_balance: number;
	declare minimum_payout_balance: number;
	declare can_withdraw: boolean;
}
