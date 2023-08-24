import { Model } from '../../model/model.service';

export class CreatorExperienceLevelModel extends Model {
	declare level: number;
	declare ability: string | null;
	declare ability_display: string | null;
	declare added_on: number;
}
