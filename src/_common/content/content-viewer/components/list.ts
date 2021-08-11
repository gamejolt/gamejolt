import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { ContentObject } from '../../content-object';
import { ContentOwner } from '../../content-owner';
import { renderChildren } from './base-component';

@Options({})
export class AppContentViewerList extends Vue {
	@Prop(ContentObject)
	data!: ContentObject;

	@Prop(Object)
	owner!: ContentOwner;

	render() {
		if (this.data.type === 'bulletList') {
			return h('ul', renderChildren(this.owner, this.data.content));
		} else if (this.data.type === 'orderedList') {
			return h('ol', renderChildren(this.owner, this.data.content));
		}
		// Shouldn't happen because child type is guarded by renderChildren
		throw new Error('Unknown list type encountered.');
	}
}
