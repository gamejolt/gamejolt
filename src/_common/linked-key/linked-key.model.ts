import { Model } from '../model/model.service';

export class LinkedKey extends Model {
	static readonly PROVIDER_STEAM = 'steam';

	key!: string;
	provider!: string;
	provider_label!: string;

	constructor(data: any = {}) {
		super(data);
	}
}

Model.create(LinkedKey);
