import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppContentMediaItem from '../../components/media-item/media-item.vue';
import { ContentObject } from '../../content-object';

@Options({})
export class AppContentViewerMediaItem extends Vue {
	@Prop({ type: ContentObject })
	contentData!: ContentObject;

	render() {
		return h(AppContentMediaItem, {
			key: this.contentData.attrs.id,
			mediaItemId: this.contentData.attrs.id,
			mediaItemWidth: this.contentData.attrs.width,
			mediaItemHeight: this.contentData.attrs.height,
			caption: this.contentData.attrs.caption,
			align: this.contentData.attrs.align,
			href: this.contentData.attrs.href,
			isEditing: false,
		});
	}
}
