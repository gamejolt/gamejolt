import View from '!view!./item.html?style=./item.styl';
import { AppImgResponsive } from 'game-jolt-frontend-lib/components/img/responsive/responsive';
import { MediaItem } from 'game-jolt-frontend-lib/components/media-item/media-item-model';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

@View
@Component({
	components: {
		AppImgResponsive,
	},
})
export class AppFormGameDevlogPostMediaItem extends Vue {
	@Prop(MediaItem)
	item!: MediaItem;

	width = 'auto';
	height = 'auto';

	@Emit('remove')
	emitRemove() {}

	created() {
		const dimensions = this.item.getDimensions(300, 130);
		this.width = dimensions.width + 'px';
		this.height = dimensions.height + 'px';
	}
}
