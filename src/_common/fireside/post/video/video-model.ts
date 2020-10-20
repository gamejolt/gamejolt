import { HistoryTick } from '../../../history-tick/history-tick-service';
import { Model } from '../../../model/model.service';

export class FiresidePostVideo extends Model {
	static PROVIDER_YOUTUBE = 'youtube';
	static PROVIDER_GAMEJOLT = 'gamejolt';

	fireside_post_id!: number;
	provider!: 'youtube' | 'gamejolt';
	video_id!: string;
	thumbnail_url!: string;
	view_count!: number;
}

Model.create(FiresidePostVideo);

export function $viewPostVideo(video: FiresidePostVideo) {
	return HistoryTick.sendBeacon('fireside-post-video', video.id);
}
