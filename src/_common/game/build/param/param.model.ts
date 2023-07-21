import { Model, defineLegacyModel } from '../../../model/model.service';

export class GameBuildParam extends defineLegacyModel(
	class GameBuildParamDefinition extends Model {
		declare game_build_id: number;
		declare name: string;
		declare value: string;
	}
) {}
