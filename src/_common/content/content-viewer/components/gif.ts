import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppContentGif from '../../components/gif/gif.vue';
import { ContentObject } from '../../content-object';
import { ContentOwner } from '../../content-owner';

@Options({})
export class AppContentViewerGif extends Vue {
	@Prop(ContentObject)
	data!: ContentObject;

	@Prop(Object)
	owner!: ContentOwner;

	render() {
		return h(AppContentGif, {
			props: {
				gifId: this.data.attrs.id,
				width: this.data.attrs.width,
				height: this.data.attrs.height,
				service: this.data.attrs.service,
				media: this.data.attrs.media,
				url: this.data.attrs.url,
				isEditing: false,
				owner: this.owner,
				isDisabled: false,
			},
		});
	}
}
