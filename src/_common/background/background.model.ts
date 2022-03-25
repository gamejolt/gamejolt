import { Model } from '../model/model.service';
import { MediaItem } from '../media-item/media-item-model';
import { Screen } from '../screen/screen-service';

const WIDTH_REGEX = /\/(\d+)\//;
const SCALING_STRETCH = 'stretch';
const SCALING_TILE = 'tile';
const DEFAULT_SCALE = 2.0;

export class Background extends Model {
	constructor(data: any = {}) {
		super(data);

		if (data.media_item) {
			this.media_item = new MediaItem(data.media_item);
		}

		if (typeof data.scale === 'number' && data.scale > 0) {
			this.scale = data.scale;
		} else {
			this.scale = DEFAULT_SCALE;
		}
	}

	declare scaling: string;
	declare media_item: MediaItem;
	declare scale: number;

	get backgroundImage() {
		if (!this.media_item) {
			return;
		}

		let url = this.media_item.mediaserver_url;
		if (this.scaling === SCALING_TILE) {
			const dpiScale = Screen.isHiDpi ? 2 : 1;
			const mediaWidth = this.media_item.width;
			const tileWidth = mediaWidth / this.scale;

			const width = Math.min(mediaWidth, tileWidth * dpiScale);
			url = url.replace(WIDTH_REGEX, `/${width}/`);
		}

		return `url(${url})`;
	}

	get backgroundSize() {
		if (this.scaling === SCALING_TILE) {
			const width = this.media_item.width / this.scale;
			const height = this.media_item.height / this.scale;
			return `${width}px ${height}px`;
		} else if (this.scaling === SCALING_STRETCH) {
			return '100% 100%';
		}
		return 'cover';
	}

	get backgroundRepeat() {
		if (this.scaling === SCALING_TILE) {
			return 'repeat';
		}
		return 'no-repeat';
	}

	get backgroundPosition() {
		return 'center';
	}
}

Model.create(Background);
