import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { AppImgResponsive } from '../../../../../../_common/img/responsive/responsive';
import { MediaItem } from '../../../../../../_common/media-item/media-item-model';

@Options({
	components: {
		AppImgResponsive,
	},
})
export default class AppFormPostMediaItem extends Vue {
	@Prop(Object)
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
