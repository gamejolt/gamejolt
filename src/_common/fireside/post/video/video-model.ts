import { HistoryTick } from '../../../history-tick/history-tick-service';
import { MediaItem } from '../../../media-item/media-item-model';
import { Model, defineLegacyModel } from '../../../model/model.service';
import { VideoSourceArray } from '../../../video/AppVideo.vue';

//** Our preference for which manifest type will try loading first. */
const manifestPreferences = ['m3u8', 'mpd'];

export class FiresidePostVideo extends defineLegacyModel(
	class FiresidePostVideoDefinition extends Model {
		declare fireside_post_id: number;
		declare thumbnail_url: string;
		declare view_count: number;
		declare is_processing: boolean;
		media: MediaItem[] = [];

		constructor(data: any = {}) {
			super(data);

			if (data.media) {
				this.media = MediaItem.populate(data.media);
			}
		}

		get posterMediaItem() {
			return this.media.find(i => i.type === MediaItem.TYPE_VIDEO_POSTER);
		}

		get postCardVideo(): VideoSourceArray | null {
			return this.media
				.filter(i => i.type === MediaItem.TYPE_TRANSCODED_VIDEO_CARD)
				.map(i => ({ src: i.img_url, type: i.filetype }));
		}

		get posterUrl() {
			return this.posterMediaItem?.mediaserver_url;
		}

		get manifestSources(): VideoSourceArray {
			const getManifestPreference = (item: MediaItem) => {
				const ext = item.filename.substring(item.filename.lastIndexOf('.') + 1);
				const index = manifestPreferences.findIndex(i => i === ext);
				// If we don't know the manifest filetype, just push it last.
				return index === -1 ? 1000 : index;
			};

			return this.media
				.filter(i => i.type === MediaItem.TYPE_VIDEO_MANIFEST)
				.sort((a, b) => getManifestPreference(a) - getManifestPreference(b))
				.map(i => ({ src: i.img_url, type: i.filetype }));
		}

		get transcodedVideos(): VideoSourceArray {
			return this.media
				.filter(i => i.type === MediaItem.TYPE_TRANSCODED_VIDEO)
				.map(i => ({ type: i.filetype, src: i.img_url }));
		}
	}
) {}

export function $viewPostVideo(video: FiresidePostVideo) {
	return HistoryTick.sendBeacon('fireside-post-video', video.id);
}
