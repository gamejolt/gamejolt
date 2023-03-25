import { ModelStoreModel } from '../model/model-store.service';
import { Model } from '../model/model.service';

export class Emoji implements ModelStoreModel {
	declare id: number;
	declare img_url: string;
	declare prefix: string;
	declare short_name: string;

	constructor(data: any = {}) {
		this.update(data);
	}

	update(data: any = {}) {
		Object.assign(this, data);
	}

	// TODO(reactions) figure this out.
	get commandString() {
		return `${this.prefix}${this.short_name}`;
	}
}

Model.create(Emoji);
