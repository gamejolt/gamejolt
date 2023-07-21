import { Model, defineLegacyModel } from '../../../model/model.service';

export class FiresidePostTag extends defineLegacyModel(
	class FiresidePostTagDefinition extends Model {
		declare fireside_post_id: number;
		declare tag: string;
		declare added_on: number;
	}
) {}
