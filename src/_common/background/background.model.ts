import { getMediaserverUrlForBounds } from '../../utils/image';
import { MediaItemModel } from '../media-item/media-item-model';
import { Model } from '../model/model.service';
import { ShopItemModelCommonFields } from '../model/shop-item-model.service';

const DefaultScale = 2.0;

export const enum BackgroundScaling {
	stretch = 'stretch',
	tile = 'tile',
}

export class BackgroundModel extends Model implements ShopItemModelCommonFields {
	declare scaling: BackgroundScaling;
	declare media_item: MediaItemModel;
	declare scale: number;
	declare name?: string;
	declare rarity?: number;

	// Shop fields
	declare is_premium?: boolean;
	declare has_active_sale?: boolean;
	declare was_approved?: boolean;

	constructor(data: any = {}) {
		super(data);

		if (data.media_item) {
			this.media_item = new MediaItemModel(data.media_item);
		}

		if (typeof data.scale === 'number' && data.scale > 0) {
			this.scale = data.scale;
		} else {
			this.scale = DefaultScale;
		}
	}

	get cssBackgroundImage() {
		if (!this.media_item) {
			return;
		}

		const { is_animated, img_url, mediaserver_url, width, height } = this.media_item;
		if (is_animated && img_url) {
			return `url(${img_url})`;
		}

		let src = mediaserver_url;
		if (this.scaling === BackgroundScaling.tile) {
			src = getMediaserverUrlForBounds({
				src,
				maxWidth: width / this.scale,
				maxHeight: height / this.scale,
			});
		}
		return `url(${src})`;
	}

	get cssBackgroundSize() {
		if (this.scaling === BackgroundScaling.tile) {
			const width = this.media_item.width / this.scale;
			const height = this.media_item.height / this.scale;
			return `${width}px ${height}px`;
		} else if (this.scaling === BackgroundScaling.stretch) {
			return '100% 100%';
		}
		return 'cover';
	}

	get cssBackgroundRepeat() {
		if (this.scaling === BackgroundScaling.tile) {
			return 'repeat';
		}
		return 'no-repeat';
	}

	get cssBackgroundPosition() {
		return 'top';
	}
}
