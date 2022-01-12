import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppEditableOverlay from '../../../../../../_common/editable-overlay/editable-overlay.vue';
import { MediaItem } from '../../../../../../_common/media-item/media-item-model';

@Options({
	components: {
		AppEditableOverlay,
	},
})
export default class AppCommunityChannelCardEdit extends Vue {
	@Prop({ type: Object, default: null }) background!: MediaItem | null;

	@Emit('click') emitClick() {}

	onClickEdit() {
		this.emitClick();
	}
}
