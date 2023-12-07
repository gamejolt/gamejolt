import { MediaItemModel } from '../../media-item/media-item-model';
import { ModelStoreModel } from '../../model/model-store.service';
import { ShopProductResource } from '../../shop/product/product-model';
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
	declare id: number;
	declare resource: ShopProductResource;
	declare resource_id: number;
	declare status: CreatorChangeRequestStatus;
	declare change_media_item?: MediaItemModel;
	declare change_name?: string;
	declare change_artist_user?: UserModel;
	declare change_sticker_emoji_short_name?: string;
	declare change_sticker_pack_sticker_ids?: number[];
	declare rejection_message?: string;

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
