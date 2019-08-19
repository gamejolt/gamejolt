import { AppImgResponsive } from '../../../../../../_common/img/responsive/responsive';
import { MediaItem } from '../../../../../../_common/media-item/media-item-model';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

@Component({
	components: {
		AppImgResponsive,
	},
})
export default class AppFormPostMediaItem extends Vue {
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
