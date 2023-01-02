import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { ContentObject } from '../../content-object';
import { renderChildren } from './AppContentViewerBaseComponent.vue';

@Options({})
export class AppContentViewerBlockquote extends Vue {
	@Prop({ type: ContentObject })
	contentData!: ContentObject;

	render() {
		return h('blockquote', {}, renderChildren(this.contentData.content));
	}
}
