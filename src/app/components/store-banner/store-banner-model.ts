import { MediaItem } from '../../../_common/media-item/media-item-model';
import { Model } from '../../../_common/model/model.service';

export class StoreBanner extends Model {
	constructor(data: any = {}) {
		super(data);

		if (data.bannerMedia) {
			this.bannerMedia = new MediaItem(data.bannerMedia);
		}
	}

	text!: string;
	button!: string;
	url!: string;
	eventLabel!: string;
	bannerMedia?: MediaItem;
}

Model.create(StoreBanner);
