import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppJolticon from '../../../vue/components/jolticon/jolticon.vue';
import { AppImgResponsive } from '../../img/responsive/responsive';

export const MediaBarItemMaxHeight = 150;

@Component({
	components: {
		AppJolticon,
		AppImgResponsive,
	},
})
export default class AppMediaBarItem extends Vue {
	@Prop(Object) item!: any;

	width = 'auto';
	height = 'auto';

	created() {
		// We set the dimensions on the thumbnails manually.
		// This way we can size it correct before it loads.
		if (this.item.media_type === 'image') {
			const dimensions = this.item.media_item.getDimensions(400, MediaBarItemMaxHeight);
			this.width = dimensions.width + 'px';
			this.height = dimensions.height + 'px';
		} else if (this.item.media_type === 'sketchfab') {
			// Sketchfab thumbnails are hardcoded to this width.
			this.height = `${MediaBarItemMaxHeight}px`;
			this.width = MediaBarItemMaxHeight / 0.5625 + 'px';
		} else {
			// Video thumbnails are hardcoded to this width.
			this.width = '200px';
		}
	}
}
