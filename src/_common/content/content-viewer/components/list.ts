import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ContentObject } from '../../content-object';
import { ContentOwner } from '../../content-owner';
import { renderChildren } from './base-component';

@Component({})
export class AppContentViewerList extends Vue {
	@Prop(ContentObject)
	data!: ContentObject;
	@Prop(Object)
	owner!: ContentOwner;

	render(h: CreateElement) {
		if (this.data.type === 'bulletList') {
			return h('ul', renderChildren(h, this.owner, this.data.content));
		} else if (this.data.type === 'orderedList') {
			return h('ol', renderChildren(h, this.owner, this.data.content));
		}
		// Shouldn't happen because child type is guarded by renderChildren
		throw new Error('Unknown list type encountered.');
	}
}
