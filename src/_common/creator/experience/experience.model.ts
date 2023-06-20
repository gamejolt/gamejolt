import { Model } from '../../model/model.service';

export class CreatorExperience extends Model {
	declare current_level: number;
	declare current_level_xp: number;
	declare current_level_xp_required: number;
	declare total_xp_earned: number;
	// TODO(creator-score) display string field for abilities
	declare ability_on_level_up: string | null;
	declare is_max_level: boolean;
}

Model.create(CreatorExperience);
