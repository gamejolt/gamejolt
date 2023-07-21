import { Model, defineLegacyModel } from '../../model/model.service';

export const enum SiteBuildStatus {
	Active = 'active',
	Inactive = 'inactive',
	Removed = 'removed',
}

export class SiteBuild extends defineLegacyModel(
	class SiteBuildDefinition extends Model {
		declare site_id: number;
		declare folder: string;
		declare status: SiteBuildStatus;
		declare added_on: number;
	}
) {}
