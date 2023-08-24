import { getCurrentServerTime } from '../../../../utils/server-time';
import { AvatarFrameModel } from '../../../avatar/frame.model';
import { Model } from '../../../model/model.service';

export class UserAvatarFrameModel extends Model {
	declare avatar_frame: AvatarFrameModel;
	declare is_active: boolean;
	declare expires_on: number | null;

	constructor(data: any = {}) {
		super(data);

		if (!data.expires_on) {
			this.expires_on = null;
		}

		if (data.avatar_frame) {
			this.avatar_frame = new AvatarFrameModel(data.avatar_frame);
		}
	}

	get isExpired() {
		if (!this.expires_on) {
			return false;
		}
		return getCurrentServerTime() > this.expires_on;
	}
}
