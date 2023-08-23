import { MediaItem } from '../media-item/media-item-model';
import { Model } from '../model/model.service';

export class EmbedMetadata extends Model {
	declare url: string;
	declare site_url: string;
	declare site_name: string;
	declare title: string;
	declare type: string | null;
	declare description: string | null;
	declare image_media_item: MediaItem | null;
	declare image_alt: string | null;

	constructor(data: any = {}) {
		super(data);

		if (data.image_media_item) {
			this.image_media_item = new MediaItem(data.image_media_item);
		}
	}
}
