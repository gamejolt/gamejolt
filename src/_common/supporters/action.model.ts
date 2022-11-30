import { Fireside } from '../fireside/fireside.model';
import { FiresidePost } from '../fireside/post/post-model';
import { Model } from '../model/model.service';
import { User } from '../user/user.model';
import { SupporterMessage } from './message.model';

const RESOURCE_FIRESIDE_POST = 'Fireside_Post';
const RESOURCE_FIRESIDE = 'Fireside';

const TYPE_CHARGED_STICKER = 'charged-sticker-placement';

export class SupporterAction extends Model {
	declare user: User;
	declare type: string;
	declare added_on: number;
	declare message?: SupporterMessage;

	declare resource: any;
	declare resource_type: string;

	declare post?: FiresidePost;
	declare fireside?: Fireside;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}

		if (data.message) {
			this.message = new SupporterMessage(data.message);
		}

		if (this.resource_type === RESOURCE_FIRESIDE_POST) {
			this.post = new FiresidePost(this.resource);
		}

		if (this.resource_type === RESOURCE_FIRESIDE) {
			this.fireside = new Fireside(this.resource);
		}
	}

	get isThanked() {
		return !!this.message;
	}

	get isChargedSticker() {
		return this.type === TYPE_CHARGED_STICKER;
	}
}

Model.create(SupporterAction);
