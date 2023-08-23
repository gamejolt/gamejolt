import { Model } from '../../model/model.service';

export class UserStripeManagedAccount extends Model {
	static readonly TYPE_COMPANY = 'company';
	static readonly TYPE_INDIVIDUAL = 'individual';

	static readonly STATUS_UNVERIFIED = 'unverified';
	static readonly STATUS_PENDING = 'pending';
	static readonly STATUS_VERIFIED = 'verified';

	static readonly TERMS_DISTRIBUTION_VERSION = 2;
	static readonly TERMS_PARTNER_VERSION = 1;
	static readonly TERMS_CREATOR_VERSION = 1;

	type!: 'company' | 'individual';
	country_code!: 'string';
	status!: 'unverified' | 'pending' | 'verified';
	tos_signed_developer!: number;
	tos_signed_developer_timestamp!: number;
	tos_signed_partner!: number;
	tos_signed_partner_timestamp!: number;
	tos_signed_creator!: number;
	tos_signed_creator_timestamp!: number;
	is_stripe_initialized!: boolean;
	is_verified!: boolean;
	skip_stripe!: boolean;
	created_on!: number;

	constructor(data: any = {}) {
		super(data);
	}
}
