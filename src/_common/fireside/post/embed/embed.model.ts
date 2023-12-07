import { EmbedMetadataModel } from '../../../embed/embed-metadata.model';
import { Model } from '../../../model/model.service';

export const TYPE_YOUTUBE = 'youtube';
export const TYPE_SKETCHFAB = 'sketchfab';

export class FiresidePostEmbedModel extends Model {
	declare url: string;
	declare type: string;
	declare extra_data: string;
	declare metadata: EmbedMetadataModel | null;
	declare is_processing: boolean;

	/**
	 * Parsed data from the `extra_data` field.
	 */
	extraData: any;

	constructor(data: any = {}) {
		super(data);

		if (data.metadata) {
			this.metadata = new EmbedMetadataModel(data.metadata);
		}

		if (this.extra_data) {
			this.extraData = JSON.parse(data.extra_data);
		} else {
			this.extraData = {};
		}
	}
}
