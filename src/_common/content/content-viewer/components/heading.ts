import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { ContentObject } from '../../content-object';
import { renderChildren } from './AppContentViewerBaseComponent.vue';

@Options({})
export class AppContentViewerHeading extends Vue {
	@Prop({ type: ContentObject })
	contentData!: ContentObject;

	render() {
		return h(
			// We do this because we want users to only be able to add H3s and H4s (SEO).
			'h' + (this.contentData.attrs.level + 2),
			{},
			renderChildren(this.contentData.content)
		);
	}
}
