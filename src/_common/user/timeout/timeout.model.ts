import { Model } from '../../model/model.service';

export class UserTimeout extends Model {
	expires_on!: number;
	reason!: string;
	reason_template!: string | null;
	resource_content!: string | null;

	// Use functions to not let vue cache.
	getIsActive() {
		return this.resource_content !== null || !this.getIsExpired();
	}

	getIsExpired() {
		return this.expires_on <= Date.now();
	}
}

Model.create(UserTimeout);
