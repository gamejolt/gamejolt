import { Model } from '../../model/model.service';
import { FIRESIDE_ROLES } from '../role/role.model';

export class FiresideChatSettings extends Model {
	constructor(data: any = {}) {
		super(data);
	}

	declare allow_images: FIRESIDE_ROLES;
	declare allow_gifs: FIRESIDE_ROLES;
	declare allow_links: FIRESIDE_ROLES;
	declare allow_spoilers: FIRESIDE_ROLES;
	declare max_message_lenth: number;
	declare slow_mode_enabled: boolean;
	declare slow_mode_seconds: number;
}

Model.create(FiresideChatSettings);
