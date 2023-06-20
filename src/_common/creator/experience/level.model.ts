import { Model } from '../../model/model.service';

export class CreatorExperienceLevel extends Model {
	declare level: number;
	// TODO(creator-score) display string field for abilities
	declare ability: string | null;
	declare added_on: number;
}

Model.create(CreatorExperienceLevel);
