import { MediaItemModel } from '../media-item/media-item-model';
import { Model } from '../model/model.service';

export class EmbedMetadataModel extends Model {
	declare url: string;
	declare site_url: string;
	declare site_name: string;
	declare title: string;
	declare type: string | null;
	declare description: string | null;
	declare image_media_item: MediaItemModel | null;
	declare image_alt: string | null;

	constructor(data: any = {}) {
		super(data);

		if (data.image_media_item) {
			this.image_media_item = new MediaItemModel(data.image_media_item);
		}
	}
}
