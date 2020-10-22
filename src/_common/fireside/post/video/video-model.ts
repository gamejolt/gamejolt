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

	constructor(data: any = {}) {
		super(data);

		if (data.media) {
			this.media = MediaItem.populate(data.media);
		}
	}

	get posterUrl() {
		// DODO: Use the correct mediaserver URL for the poster.
		return 'https://m.gjcdn.net/user-header/1600/78378-ll-ufuupdeb-v4.webp';
		return this.thumbnail_url;
	}

	get manifestUrls() {
		return this.media.map(i => i.img_url);
	}
}

Model.create(FiresidePostVideo);

export function $viewPostVideo(video: FiresidePostVideo) {
	return HistoryTick.sendBeacon('fireside-post-video', video.id);
}
