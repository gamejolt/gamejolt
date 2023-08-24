import { Model } from '../model/model.service';

export class TranslationModel extends Model {
	resource!: string;
	resource_id!: number;
	lang!: string;
	content!: string;
}
