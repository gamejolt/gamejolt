import { MediaItemModel } from '../../../_common/media-item/media-item-model';
import { Model } from '../../../_common/model/model.service';

export class StoreBannerModel extends Model {
	constructor(data: any = {}) {
		super(data);

		if (data.bannerMedia) {
			this.banner_media = new MediaItemModel(data.banner_media);
		}
	}

	text!: string;
	button!: string;
	url!: string;
	event_label!: string;
	banner_media?: MediaItemModel;
}
