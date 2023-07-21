import { EmbedMetadata } from '../../../embed/embed-metadata.model';
import { Model, defineLegacyModel } from '../../../model/model.service';

export const TYPE_YOUTUBE = 'youtube';
export const TYPE_SKETCHFAB = 'sketchfab';

export class FiresidePostEmbed extends defineLegacyModel(
	class FiresidePostEmbedDefinition extends Model {
		declare url: string;
		declare type: string;
		declare extra_data: string;
		declare metadata: EmbedMetadata | null;
		declare is_processing: boolean;

		/**
		 * Parsed data from the `extra_data` field.
		 */
		extraData: any;

		constructor(data: any = {}) {
			super(data);

			if (data.metadata) {
				this.metadata = new EmbedMetadata(data.metadata);
			}

			if (this.extra_data) {
				this.extraData = JSON.parse(data.extra_data);
			} else {
				this.extraData = {};
			}
		}
	}
) {}
