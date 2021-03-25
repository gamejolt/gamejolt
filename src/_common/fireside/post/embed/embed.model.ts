import { Model } from '../../../model/model.service';

export const TYPE_YOUTUBE = 'youtube';

export class FiresidePostEmbed extends Model {
	url!: string;
	video_id!: string;
	type!: string;
}

Model.create(FiresidePostEmbed);
