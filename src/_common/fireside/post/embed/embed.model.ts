import { Model } from '../../../model/model.service';

export const TYPE_YOUTUBE = 'youtube';
export const TYPE_SKETCHFAB = 'sketchfab';

export class FiresidePostEmbed extends Model {
	url!: string;
	type!: string;
	extra_data!: string;

	/**
	 * Parsed data from the `extra_data` field.
	 */
	extraData: any;

	constructor(data: any = {}) {
		super(data);

		this.extraData = JSON.parse(data.extra_data);
	}
}

Model.create(FiresidePostEmbed);
