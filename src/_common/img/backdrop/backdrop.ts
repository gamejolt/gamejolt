import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import { MediaItem } from '../../media-item/media-item-model';

@Component({})
export default class AppImgBackdrop extends Vue {
	@Prop(propOptional(MediaItem))
	item?: MediaItem;

	@Prop(propOptional(Boolean))
	block?: boolean;

	@Prop(propOptional(String))
	radius?: string;

	// @Prop(propOptional(Number))
	// height?: number;

	/* maybe for Community cards - they have a transparency filter */
	// @Prop(propOptional(Boolean))
	// trans?: boolean;

	get _borderRadius() {
		if (this.block) {
			return;
		}

		if (this.radius) {
			return {
				borderRadius: this.radius,
				padding: '1px',
			};
		}
	}

	// get itemWidth() {
	// 	if (this.mediaItem && this.mediaItem.width) {
	// 		return this.mediaItem.width;
	// 	}

	// 	return;
	// }

	// get itemHeight() {
	// 	if (this.mediaItem && this.mediaItem.height) {
	// 		return this.mediaItem.height;
	// 	}

	// 	return;
	// }

	// get setHeight() {
	// 	return this.height;
	// }

	get wrapperStyling() {
		let style = {};

		Object.assign(style, this._borderRadius);

		if (!this.item) {
			return style;
		}

		// Object.assign(style, {
		// 	height: this.itemHeight,
		// 	width: this.itemWidth,
		// });

		// if (this.setHeight) {
		// 	Object.assign(style, {
		// 		height: this.setHeight,
		// 	});
		// }

		if (this.item.avg_img_color && !this.item.img_has_transparency) {
			Object.assign(style, {
				backgroundColor: '#' + this.item.avg_img_color,
				/*	This might be needed for the Community sorting cards.
				 *	We do a color/opacity filter on them, so it looks pretty
				 * 	different if we don't change that somehow in this component. */
				// opacity: this.trans ? 0.5 : 1,
			});
		}

		return style;
	}
}
