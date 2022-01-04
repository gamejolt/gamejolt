import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppContentSticker from '../../components/sticker/sticker.vue';
import { ContentObject } from '../../content-object';

@Options({})
export class AppContentViewerSticker extends Vue {
	@Prop({ type: ContentObject })
	contentData!: ContentObject;

	render() {
		return h(AppContentSticker, {
			key: this.contentData.attrs.id,
			stickerId: this.contentData.attrs.id,
			isEditing: false,
		});
	}
}
