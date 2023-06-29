import { Model } from '../../model/model.service';

export class CreatorExperienceLevel extends Model {
	declare level: number;
	declare ability: string | null;
	declare ability_display: string | null;
	declare added_on: number;
}

Model.create(CreatorExperienceLevel);
