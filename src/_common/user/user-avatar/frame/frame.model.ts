import { getCurrentServerTime } from '../../../../utils/server-time';
import { Api } from '../../../api/api.service';
import { AvatarFrameModel } from '../../../avatar/frame.model';
import { ModelStoreModel, storeModel } from '../../../model/model-store.service';

export class UserAvatarFrameModel implements ModelStoreModel {
	declare id: number;
	declare avatar_frame: AvatarFrameModel;
	declare is_active: boolean;
	declare expires_on: number | null;
	declare is_favorite: boolean;

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

export async function toggleFavorite(model: UserAvatarFrameModel) {
	return Api.sendRequest(
		`/web/dash/avatar/toggle-favorite-frame/${model.avatar_frame.id}`,
		{},
		{ detach: true }
	);
}
