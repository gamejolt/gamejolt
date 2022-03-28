import { Model } from '../model/model.service';
import { MediaItem } from '../media-item/media-item-model';
import { Screen } from '../screen/screen-service';

const WidthRegex = /\/(\d+)\//;
const ScalingStretch = 'stretch';
const ScalingTile = 'tile';
const DefaultScale = 2.0;

export class Background extends Model {
	constructor(data: any = {}) {
		super(data);

		if (data.media_item) {
			this.media_item = new MediaItem(data.media_item);
		}

		if (typeof data.scale === 'number' && data.scale > 0) {
			this.scale = data.scale;
		} else {
			this.scale = DefaultScale;
		}
	}

	declare scaling: string;
	declare media_item: MediaItem;
	declare scale: number;

	get cssBackgroundImage() {
		if (!this.media_item) {
			return;
		}

		let url = this.media_item.mediaserver_url;
		if (this.scaling === ScalingTile) {
			const dpiScale = Screen.isHiDpi ? 2 : 1;
			const mediaWidth = this.media_item.width;
			const tileWidth = mediaWidth / this.scale;

			const width = Math.min(mediaWidth, tileWidth * dpiScale);
			url = url.replace(WidthRegex, `/${width}/`);
		}

		return `url(${url})`;
	}

	get cssBackgroundSize() {
		if (this.scaling === ScalingTile) {
			const width = this.media_item.width / this.scale;
			const height = this.media_item.height / this.scale;
			return `${width}px ${height}px`;
		} else if (this.scaling === ScalingStretch) {
			return '100% 100%';
		}
		return 'cover';
	}

	get cssBackgroundRepeat() {
		if (this.scaling === ScalingTile) {
			return 'repeat';
		}
		return 'no-repeat';
	}

	get cssBackgroundPosition() {
		return 'top';
	}
}

Model.create(Background);
