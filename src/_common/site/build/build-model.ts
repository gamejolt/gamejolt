import { Model } from '~common/model/model.service';

export const SiteBuildStatusActive = 'active';
export const SiteBuildStatusInactive = 'inactive';
export const SiteBuildStatusRemoved = 'removed';

export type SiteBuildStatus =
	| typeof SiteBuildStatusActive
	| typeof SiteBuildStatusInactive
	| typeof SiteBuildStatusRemoved;

export class SiteBuildModel extends Model {
	declare site_id: number;
	declare folder: string;
	declare status: SiteBuildStatus;
	declare added_on: number;
}
