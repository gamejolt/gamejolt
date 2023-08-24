import { Model } from '../../model/model.service';

export class UserTimeoutModel extends Model {
	declare expires_on: number;
	declare reason: string;
	declare reason_template: string | null;
	declare resource_content: string | null;

	// Use functions to not let vue cache.
	getIsActive() {
		return this.resource_content !== null || !this.getIsExpired();
	}

	getIsExpired() {
		return this.expires_on <= Date.now();
	}
}
