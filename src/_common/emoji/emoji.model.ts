import { ModelStoreModel } from '../model/model-store.service';
import { Model } from '../model/model.service';

export class Emoji implements ModelStoreModel {
	declare id: number;
	declare img_url: string;
	declare short_name: string;

	constructor(data: any = {}) {
		this.update(data);
	}

	update(data: any = {}) {
		Object.assign(this, data);
	}
}

Model.create(Emoji);
