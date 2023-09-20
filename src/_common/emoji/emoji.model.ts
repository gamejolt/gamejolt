import { ModelStoreModel } from '../model/model-store.service';

export class EmojiModel implements ModelStoreModel {
	declare id: number;
	declare img_url: string;
	declare prefix: string;
	declare short_name: string;

	update(data: any = {}) {
		Object.assign(this, data);
	}

	get commandString() {
		return `:${this.prefix}${this.short_name}:`;
	}
}
