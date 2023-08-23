import { Model } from '../../../model/model.service';

export class GameBuildParam extends Model {
	declare game_build_id: number;
	declare name: string;
	declare value: string;
}
