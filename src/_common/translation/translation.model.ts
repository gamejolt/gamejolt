import { Model } from '../model/model.service';

export class Translation extends Model {
	resource!: string;
	resource_id!: number;
	lang!: string;
	content!: string;
}
