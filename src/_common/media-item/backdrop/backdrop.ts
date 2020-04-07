import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import { MediaItem } from '../../media-item/media-item-model';

@Component({})
export default class AppMediaItemBackdrop extends Vue {
	@Prop(propOptional(MediaItem))
	mediaItem!: MediaItem;

	@Prop(propOptional(String))
	radius?: 'sm' | 'md' | 'lg' | 'full';

	get radiusClass() {
		if (!this.radius) {
			return;
		}

		return '-' + this.radius;
	}

	get wrapperStyling() {
		if (
			!this.mediaItem ||
			!this.mediaItem.avg_img_color ||
			this.mediaItem.img_has_transparency
		) {
			return;
		}

		return { backgroundColor: '#' + this.mediaItem.avg_img_color };
	}
}
