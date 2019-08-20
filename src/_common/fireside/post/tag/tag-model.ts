import { Model } from '../../../model/model.service';

export class FiresidePostTag extends Model {
	fireside_post_id!: number;
	tag!: string;
	added_on!: number;
}

Model.create(FiresidePostTag);
