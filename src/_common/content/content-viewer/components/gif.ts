import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppContentGif from '../../components/AppContentGif.vue';
import { ContentObject } from '../../content-object';

@Options({})
export class AppContentViewerGif extends Vue {
	@Prop({ type: ContentObject })
	contentData!: ContentObject;

	render() {
		return h(AppContentGif, {
			gifId: this.contentData.attrs.id,
			width: this.contentData.attrs.width,
			height: this.contentData.attrs.height,
			service: this.contentData.attrs.service,
			media: this.contentData.attrs.media,
			url: this.contentData.attrs.url,
			isEditing: false,
			isDisabled: false,
		});
	}
}
