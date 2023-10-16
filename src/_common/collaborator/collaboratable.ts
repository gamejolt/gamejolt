import { Model } from '../model/model.service';

export type Perm =
	| 'all'
	| 'analytics'
	| 'sales'
	| 'details'
	| 'media'
	| 'devlogs'
	| 'comments'
	| 'ratings'
	| 'builds'
	| 'game-api'
	| 'feature'
	| 'community-features'
	| 'community-posts'
	| 'community-media'
	| 'community-details'
	| 'community-channels'
	| 'community-description'
	| 'community-moderators'
	| 'community-blocks'
	| 'community-games'
	| 'community-activity'
	| 'community-competitions';

export const Collaboratable = <T extends new (...args: any[]) => Model>(Base: T) =>
	class extends Base {
		perms?: Perm[];

		hasPerms(required?: Perm | Perm[], either?: boolean) {
			if (!this.perms) {
				return false;
			}

			if (!required || this.perms.indexOf('all') !== -1) {
				return true;
			}

			required = Array.isArray(required) ? required : [required];
			const missingPerms = required.filter(perm => this.perms!.indexOf(perm) === -1);
			if (either) {
				return missingPerms.length !== required.length;
			} else {
				return missingPerms.length === 0;
			}
		}
	};
