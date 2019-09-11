import { Model } from '../../../model/model.service';

export class FiresidePostVideo extends Model {
	static PROVIDER_YOUTUBE = 'youtube';

	fireside_post_id!: number;
	provider!: 'youtube';
	video_id!: string;
	thumbnail_url!: string;
}

Model.create(FiresidePostVideo);
