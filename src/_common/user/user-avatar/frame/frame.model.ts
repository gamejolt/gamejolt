import { AvatarFrameModel } from '~common/avatar/frame.model';
import { ModelStoreModel, storeModel } from '~common/model/model-store.service';
import { getCurrentServerTime } from '~utils/server-time';

export class UserAvatarFrameModel implements ModelStoreModel {
	declare id: number;
	declare avatar_frame: AvatarFrameModel;
	declare is_active: boolean;
	declare expires_on: number | null;

	update(data: any) {
		Object.assign(this, data);

		if (!data.expires_on) {
			this.expires_on = null;
		}

		if (data.avatar_frame) {
			this.avatar_frame = storeModel(AvatarFrameModel, data.avatar_frame);
		}
	}

	get isExpired() {
		if (!this.expires_on) {
			return false;
		}
		return getCurrentServerTime() > this.expires_on;
	}
}
