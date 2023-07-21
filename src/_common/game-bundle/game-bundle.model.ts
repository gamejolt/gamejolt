import { Model, defineLegacyModel } from '../model/model.service';

export class GameBundle extends defineLegacyModel(
	class GameBundleDefinition extends Model {
		declare title: string;
		declare description: string;
		declare slug: string;
		declare added_on: number;
	}
) {}
