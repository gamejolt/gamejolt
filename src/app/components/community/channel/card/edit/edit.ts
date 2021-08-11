import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional } from '../../../../../../utils/vue';
import AppEditableOverlay from '../../../../../../_common/editable-overlay/editable-overlay.vue';
import { MediaItem } from '../../../../../../_common/media-item/media-item-model';

@Options({
	components: {
		AppEditableOverlay,
	},
})
export default class AppCommunityChannelCardEdit extends Vue {
	@Prop(propOptional(MediaItem, null)) background!: MediaItem | null;

	@Emit('click') emitClick() {}

	onClickEdit() {
		this.emitClick();
	}
}
