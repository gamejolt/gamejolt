import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppContentSticker from '../../components/sticker/sticker.vue';
import { ContentObject } from '../../content-object';
import { ContentOwner } from '../../content-owner';

@Options({})
export class AppContentViewerSticker extends Vue {
	@Prop(ContentObject)
	contentData!: ContentObject;

	@Prop(Object)
	owner!: ContentOwner;

	render() {
		return h(AppContentSticker, {
			key: this.contentData.attrs.id,
			stickerId: this.contentData.attrs.id,
			isEditing: false,
			owner: this.owner,
		});
	}
}
