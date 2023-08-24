import { HistoryTick } from '../../../history-tick/history-tick-service';
import { MediaItemModel, MediaItemType } from '../../../media-item/media-item-model';
import { Model } from '../../../model/model.service';
import { VideoSourceArray } from '../../../video/AppVideo.vue';

//** Our preference for which manifest type will try loading first. */
const manifestPreferences = ['m3u8', 'mpd'];

export class FiresidePostVideoModel extends Model {
	declare fireside_post_id: number;
	declare thumbnail_url: string;
	declare view_count: number;
	declare is_processing: boolean;
	media: MediaItemModel[] = [];

	constructor(data: any = {}) {
		super(data);

		if (data.media) {
			this.media = MediaItemModel.populate(data.media);
		}
	}

	get posterMediaItem() {
		return this.media.find(i => i.type === MediaItemType.VideoPoster);
	}

	get postCardVideo(): VideoSourceArray | null {
		return this.media
			.filter(i => i.type === MediaItemType.TranscodedVideoCard)
			.map(i => ({ src: i.img_url, type: i.filetype }));
	}

	get posterUrl() {
		return this.posterMediaItem?.mediaserver_url;
	}

	get manifestSources(): VideoSourceArray {
		const getManifestPreference = (item: MediaItemModel) => {
			const ext = item.filename.substring(item.filename.lastIndexOf('.') + 1);
			const index = manifestPreferences.findIndex(i => i === ext);
			// If we don't know the manifest filetype, just push it last.
			return index === -1 ? 1000 : index;
		};

		return this.media
			.filter(i => i.type === MediaItemType.VideoManifest)
			.sort((a, b) => getManifestPreference(a) - getManifestPreference(b))
			.map(i => ({ src: i.img_url, type: i.filetype }));
	}

	get transcodedVideos(): VideoSourceArray {
		return this.media
			.filter(i => i.type === MediaItemType.TranscodedVideo)
			.map(i => ({ type: i.filetype, src: i.img_url }));
	}
}

export function $viewPostVideo(video: FiresidePostVideoModel) {
	return HistoryTick.sendBeacon('fireside-post-video', video.id);
}
