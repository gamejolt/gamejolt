import { MediaItem } from '../../../_common/media-item/media-item-model';
import { Model } from '../../../_common/model/model.service';

export class StoreBanner extends Model {
	constructor(data: any = {}) {
		super(data);

		if (data.bannerMedia) {
			this.banner_media = new MediaItem(data.banner_media);
		}
	}

	text!: string;
	button!: string;
	url!: string;
	event_label!: string;
	banner_media?: MediaItem;
}
