import { Model } from '../../../model/model.service';

export class GameBuildParam extends Model {
	game_build_id!: number;
	name!: string;
	value!: string;
}

Model.create(GameBuildParam);
