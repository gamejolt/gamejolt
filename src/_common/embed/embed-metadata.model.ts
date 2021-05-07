import { MediaItem } from '../media-item/media-item-model';
import { Model } from '../model/model.service';

export class EmbedMetadata extends Model {
	url!: string;
	site_url!: string;
	site_name!: string;
	title!: string;
	type!: string | null;
	description!: string | null;

	image_media_item!: MediaItem | null;
	image_alt!: string | null;

	constructor(data: any = {}) {
		super(data);

		if (data.image_media_item) {
			this.image_media_item = new MediaItem(data.image_media_item);
		}
	}
}

Model.create(EmbedMetadata);
