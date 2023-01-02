import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { ContentObject } from '../../content-object';
import { renderChildren } from './AppContentViewerBaseComponent.vue';

@Options({})
export class AppContentViewerList extends Vue {
	@Prop({ type: ContentObject })
	contentData!: ContentObject;

	render() {
		if (this.contentData.type === 'bulletList') {
			return h('ul', {}, renderChildren(this.contentData.content));
		} else if (this.contentData.type === 'orderedList') {
			return h('ol', {}, renderChildren(this.contentData.content));
		}
		// Shouldn't happen because child type is guarded by renderChildren
		throw new Error('Unknown list type encountered.');
	}
}
