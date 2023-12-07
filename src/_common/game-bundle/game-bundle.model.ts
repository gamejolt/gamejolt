import { Model } from '../model/model.service';

export class GameBundleModel extends Model {
	declare title: string;
	declare description: string;
	declare slug: string;
	declare added_on: number;
}
