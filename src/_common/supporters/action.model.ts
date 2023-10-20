import { FiresideModel } from '../fireside/fireside.model';
import { FiresidePostModel } from '../fireside/post/post-model';
import { Model } from '../model/model.service';
import { UserModel } from '../user/user.model';
import { SupporterMessageModel } from './message.model';

const RESOURCE_FIRESIDE_POST = 'Fireside_Post';
const RESOURCE_FIRESIDE = 'Fireside';

const TYPE_CHARGED_STICKER = 'charged-sticker-placement';

export class SupporterActionModel extends Model {
	declare user: UserModel;
	declare type: string;
	declare added_on: number;
	declare message?: SupporterMessageModel;

	declare resource_type: string;

	declare post?: FiresidePostModel;
	declare fireside?: FiresideModel;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new UserModel(data.user);
		}

		if (data.message) {
			this.message = new SupporterMessageModel(data.message);
		}

		if (data.resource && this.resource_type === RESOURCE_FIRESIDE_POST) {
			this.post = new FiresidePostModel(data.resource);
		}

		if (data.resource && this.resource_type === RESOURCE_FIRESIDE) {
			this.fireside = new FiresideModel(data.resource);
		}

		delete (this as any).resource;
	}

	get isThanked() {
		return !!this.message;
	}

	get isChargedSticker() {
		return this.type === TYPE_CHARGED_STICKER;
	}
}
