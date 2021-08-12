import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { ContentObject } from '../../content-object';
import { ContentOwner } from '../../content-owner';
import { renderChildren } from './base-component';

@Options({})
export class AppContentViewerHeading extends Vue {
	@Prop(ContentObject)
	data!: ContentObject;

	@Prop(Object)
	owner!: ContentOwner;

	render() {
		return h(
			// We do this because we want users to only be able to add H3s and H4s (SEO).
			'h' + (this.data.attrs.level + 2),
			{},
			renderChildren(this.owner, this.data.content)
		);
	}
}
