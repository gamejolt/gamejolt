import { Model } from '../model/model.service';

export const enum LinkedKeyProvider {
	Steam = 'steam',
}

export class LinkedKey extends Model {
	declare key: string;
	declare provider: LinkedKeyProvider;
	declare provider_label: string;
}
