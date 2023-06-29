import { Model } from '../../model/model.service';

export class CreatorExperience extends Model {
	declare current_level: number;
	declare current_level_xp: number;
	declare current_level_xp_required: number;
	declare total_xp_earned: number;
	declare ability_on_level_up: string | null;
	declare ability_on_level_up_display: string | null;
	declare is_max_level: boolean;
}

Model.create(CreatorExperience);
