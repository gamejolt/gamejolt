import { getCurrentServerTime } from '../../../../utils/server-time';
import { AvatarFrame } from '../../../avatar/frame.model';
import { Model, defineLegacyModel } from '../../../model/model.service';

export class UserAvatarFrame extends defineLegacyModel(
	class UserAvatarFrameDefinition extends Model {
		declare avatar_frame: AvatarFrame;
		declare is_active: boolean;
		declare expires_on: number | null;

		constructor(data: any = {}) {
			super(data);

			if (!data.expires_on) {
				this.expires_on = null;
			}

			if (data.avatar_frame) {
				this.avatar_frame = new AvatarFrame(data.avatar_frame);
			}
		}

		get isExpired() {
			if (!this.expires_on) {
				return false;
			}
			return getCurrentServerTime() > this.expires_on;
		}
	}
) {}
