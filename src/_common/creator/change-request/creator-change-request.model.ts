import { MediaItemModel } from '../../media-item/media-item-model';
import { ModelStoreModel } from '../../model/model-store.service';
import { UserModel } from '../../user/user.model';

export const enum CreatorChangeRequestStatus {
	Initial = 'initial',
	Submitted = 'submitted',
	InReview = 'in-review',
	Approved = 'approved',
	Rejected = 'rejected',
	Dismissed = 'dismissed',
}

export class CreatorChangeRequestModel implements ModelStoreModel {
	// TODO(creator-shops) (backend) Need the resource and resource_id fields
	// returned here.
	declare id: number;
	declare resource: string;
	declare resource_id: number;
	declare status: CreatorChangeRequestStatus;
	declare change_media_item?: MediaItemModel;
	declare change_name?: string;
	declare change_artist_user?: UserModel;
	declare change_data: string;

	declare added_on: number;
	declare approved_on: number;
	declare rejected_on: number;

	update(data: any) {
		Object.assign(this, data);

		if (data.change_media_item) {
			this.change_media_item = new MediaItemModel(data.change_media_item);
		}

		if (data.change_artist_user) {
			this.change_artist_user = new UserModel(data.change_artist_user);
		}
	}
}
