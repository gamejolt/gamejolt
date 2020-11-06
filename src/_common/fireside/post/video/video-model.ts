import { HistoryTick } from '../../../history-tick/history-tick-service';
import { MediaItem } from '../../../media-item/media-item-model';
import { Model } from '../../../model/model.service';
import { VideoSourceArray } from '../../../video/video';

//** Our preference for which manifest type will try loading first. */
const manifestPreferences = ['mpd', 'm3u8'];

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
		const getManifestPreference = (item: MediaItem) => {
			const ext = item.filename.substring(item.filename.lastIndexOf('.') + 1);
			const index = manifestPreferences.findIndex(i => i === ext);
			// If we don't know the manifest filetype, just push it last.
			return index === -1 ? 1000 : index;
		};

		return this.media
			.filter(i => i.type === MediaItem.TYPE_VIDEO_MANIFEST)
			.sort((a, b) => getManifestPreference(a) - getManifestPreference(b))
			.map(i => i.img_url);
	}

	get transcodedVideos(): VideoSourceArray {
		const videoSources: VideoSourceArray = [];
		this.media.map(i => {
			if (i.type === MediaItem.TYPE_TRANSCODED_VIDEO) {
				videoSources.push({
					type: i.filetype,
					src: i.img_url,
				});
			}
		});
		return videoSources;
	}
}

Model.create(FiresidePostVideo);

export function $viewPostVideo(video: FiresidePostVideo) {
	return HistoryTick.sendBeacon('fireside-post-video', video.id);
}
