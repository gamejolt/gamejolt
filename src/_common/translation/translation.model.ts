import { Model } from '../model/model.service';

export class TranslationModel extends Model {
	declare resource: string;
	declare resource_id: number;
	declare lang: string;
	declare content: string;
}
