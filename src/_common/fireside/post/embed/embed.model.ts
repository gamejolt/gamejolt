import { Model } from '../../../model/model.service';

export class FiresidePostEmbed extends Model {
	url!: string;
	video_id!: string;
}

Model.create(FiresidePostEmbed);
