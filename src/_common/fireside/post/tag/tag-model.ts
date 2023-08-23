import { Model } from '../../../model/model.service';

export class FiresidePostTag extends Model {
	declare fireside_post_id: number;
	declare tag: string;
	declare added_on: number;
}
