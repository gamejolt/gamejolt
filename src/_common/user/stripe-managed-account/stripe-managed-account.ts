import { Model } from '../../model/model.service';

export const enum UserStripeManagedAccountType {
	Company = 'company',
	Individual = 'individual',
}

export const enum UserStripeManagedAccountStatus {
	Unverified = 'unverified',
	Pending = 'pending',
	Verified = 'verified',
}

export const ManagedAccountTermsDistributionVersion = 2;
export const ManagedAccountTermsPartnerVersion = 1;
export const ManagedAccountTermsCreatorVersion = 1;

export class UserStripeManagedAccountModel extends Model {
	declare type: UserStripeManagedAccountType;
	declare country_code: string;
	declare status: UserStripeManagedAccountStatus;
	declare tos_signed_developer: number;
	declare tos_signed_developer_timestamp: number;
	declare tos_signed_partner: number;
	declare tos_signed_partner_timestamp: number;
	declare tos_signed_creator: number;
	declare tos_signed_creator_timestamp: number;
	declare is_stripe_initialized: boolean;
	declare is_verified: boolean;
	declare skip_stripe: boolean;
	declare created_on: number;

	constructor(data: any = {}) {
		super(data);
	}
}
