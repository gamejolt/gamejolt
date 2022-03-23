import { Model } from '../model/model.service';
import { MediaItem } from '../media-item/media-item-model';
import { Screen } from '../screen/screen-service';

export class Background extends Model {
	static readonly SCALING_STRETCH = 'stretch';
	static readonly SCALING_TILE = 'tile';

	static readonly DEFAULT_SCALE = 2.0;

	constructor(data: any = {}) {
		super(data);

		if (data.media_item) {
			this.media_item = new MediaItem(data.media_item);
		}

		if (typeof data.scale == 'number' && data.scale > 0) {
			this.scale = data.scale;
		} else {
			this.scale = Background.DEFAULT_SCALE;
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
		if (this.scaling == Background.SCALING_TILE) {
			const WIDTH_REGEX = /\/(\d+)\//;
			const scale = Screen.isHiDpi ? 2 : 1;
			const width = Math.min(this.displayWidth * scale, this.media_item.width);

			url = url.replace(WIDTH_REGEX, `/${width}/`);
		}
		return `url(${url})`;
	}
	get backgroundSize() {
		if (this.scaling == Background.SCALING_TILE) {
			return `${this.displayWidth}px ${this.displayHeight}px`;
		}
		return '100% 100%';
	}

	get backgroundRepeat() {
		if (this.scaling == Background.SCALING_TILE) {
			return 'repeat';
		}
		return 'no-repeat';
	}

	/// The pixel density we want to display the [mediaItem] with.
	get displayScale() {
		// TODO(backgrounds): Change our scale so that we only cache image size as
		// the min size between [MediaItemModel.dimensions.shortestSide] and
		// [window.physicalSize.shortestSide].

		// ignore: deprecated_member_use_from_same_package
		const scale = this.scale;
		if (typeof scale == 'number') {
			return scale;
		}
		return Background.DEFAULT_SCALE;
	}

	get displayWidth() {
		return this.media_item.width / this.displayScale;
	}

	get displayHeight() {
		return this.media_item.height / this.displayScale;
	}
}

Model.create(Background);
