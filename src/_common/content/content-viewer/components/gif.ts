import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppContentGif from '../../components/gif/gif.vue';
import { ContentObject } from '../../content-object';
import { ContentOwner } from '../../content-owner';

@Options({})
export class AppContentViewerGif extends Vue {
	@Prop(ContentObject)
	contentData!: ContentObject;

	@Prop(Object)
	owner!: ContentOwner;

	render() {
		return h(AppContentGif, {
			gifId: this.contentData.attrs.id,
			width: this.contentData.attrs.width,
			height: this.contentData.attrs.height,
			service: this.contentData.attrs.service,
			media: this.contentData.attrs.media,
			url: this.contentData.attrs.url,
			isEditing: false,
			owner: this.owner,
			isDisabled: false,
		});
	}
}
