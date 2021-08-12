import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { ContentObject } from '../../content-object';
import { ContentOwner } from '../../content-owner';
import { renderChildren } from './base-component';

@Options({})
export class AppContentViewerBlockquote extends Vue {
	@Prop(ContentObject)
	data!: ContentObject;

	@Prop(Object)
	owner!: ContentOwner;

	render() {
		return h('blockquote', {}, renderChildren(this.owner, this.data.content));
	}
}
