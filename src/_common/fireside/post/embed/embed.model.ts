import { EmbedMetadata } from '../../../embed/embed-metadata.model';
import { Model } from '../../../model/model.service';

export const TYPE_YOUTUBE = 'youtube';
export const TYPE_SKETCHFAB = 'sketchfab';

export class FiresidePostEmbed extends Model {
	url!: string;
	type!: string;
	extra_data!: string;
	metadata!: EmbedMetadata | null;
	is_processing!: boolean;

	/**
	 * Parsed data from the `extra_data` field.
	 */
	extraData: any;

	constructor(data: any = {}) {
		super(data);

		if (data.metadata) {
			this.metadata = new EmbedMetadata(data.metadata);
		}

		this.extraData = JSON.parse(data.extra_data);
	}
}

Model.create(FiresidePostEmbed);
