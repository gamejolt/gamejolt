import { HistoryTick } from '../../../history-tick/history-tick-service';
import { MediaItem } from '../../../media-item/media-item-model';
import { Model } from '../../../model/model.service';

export class FiresidePostVideo extends Model {
	static PROVIDER_YOUTUBE = 'youtube';
	static PROVIDER_GAMEJOLT = 'gamejolt';

	fireside_post_id!: number;
	provider!: 'youtube' | 'gamejolt';
	video_id!: string;
	thumbnail_url!: string;
	view_count!: number;
	media: MediaItem[] = [];
	is_processing!: boolean;

	constructor(data: any = {}) {
		super(data);

		if (data.media) {
			this.media = MediaItem.populate(data.media);
		}
	}

	get posterMediaItem() {
		return this.media.find(i => i.type === MediaItem.TYPE_VIDEO_POSTER);
	}

	get posterUrl() {
		return this.posterMediaItem?.mediaserver_url;
	}

	get manifestUrls() {
		return this.media
			.filter(i => i.type === MediaItem.TYPE_TRANSCODED && i.filename.endsWith('.mpd'))
			.map(i => i.img_url);
	}
}

Model.create(FiresidePostVideo);

export function $viewPostVideo(video: FiresidePostVideo) {
	return HistoryTick.sendBeacon('fireside-post-video', video.id);
}
