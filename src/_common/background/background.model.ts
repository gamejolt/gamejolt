import { CSSProperties } from 'vue';
import { getMediaserverUrlForBounds } from '../../utils/image';
import { MediaItemModel } from '../media-item/media-item-model';
import { ModelStoreModel } from '../model/model-store.service';
import { ShopProductCommonFields } from '../shop/product/product-model';

const DefaultScale = 2.0;

export const enum BackgroundScaling {
	stretch = 'stretch',
	tile = 'tile',
}

export class BackgroundModel implements ModelStoreModel, ShopProductCommonFields {
	declare id: number;
	declare scaling: BackgroundScaling;
	declare media_item: MediaItemModel;
	declare scale: number;
	declare name: string;
	declare description: string | undefined;
	declare rarity?: number;

	// Shop fields
	declare is_premium: boolean;
	declare has_active_sale: boolean;
	declare was_approved: boolean;
	declare added_on: number | undefined;

	update(data: any) {
		Object.assign(this, data);

		if (data.media_item) {
			this.media_item = new MediaItemModel(data.media_item);
		}

		if (typeof data.scale === 'number' && data.scale > 0) {
			this.scale = data.scale;
		} else {
			this.scale = DefaultScale;
		}
	}
}

/**
 * Returns {@link img_url} for animated backgrounds or pre-scaled
 * {@link mediaserver_url} for others.
 */
export function getBackgroundImgUrl(background: BackgroundModel) {
	const { is_animated, img_url, mediaserver_url, width, height } = background.media_item;
	if (is_animated && img_url) {
		return img_url;
	}

	const { scaling, scale } = background;
	let src = mediaserver_url;
	if (scaling === BackgroundScaling.tile) {
		src = getMediaserverUrlForBounds({
			src,
			maxWidth: width / scale,
			maxHeight: height / scale,
		});
	}
	return src;
}
/**
 * Helper function to assign CSSProperties based on the {@link background} data.
 */
export function getBackgroundCSSProperties(background: BackgroundModel) {
	const { scaling, media_item, scale } = background;

	let backgroundSize = 'cover';
	let backgroundRepeat = 'no-repeat';

	switch (scaling) {
		case BackgroundScaling.tile: {
			const width = media_item.width / scale;
			const height = media_item.height / scale;
			backgroundSize = `${width}px ${height}px`;
			backgroundRepeat = 'repeat';
			break;
		}

		case BackgroundScaling.stretch:
			backgroundSize = `100% 100%`;
			break;
	}

	return {
		backgroundImage: `url(${getBackgroundImgUrl(background)})`,
		backgroundPosition: `top`,
		backgroundRepeat,
		backgroundSize,
	} satisfies CSSProperties;
}
