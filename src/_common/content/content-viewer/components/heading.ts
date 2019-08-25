import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ContentObject } from '../../content-object';
import { ContentOwner } from '../../content-owner';
import { renderChildren } from './base-component';

@Component({})
export class AppContentViewerHeading extends Vue {
	@Prop(ContentObject)
	data!: ContentObject;
	@Prop(Object)
	owner!: ContentOwner;

	render(h: CreateElement) {
		return h(
			'h' + (this.data.attrs.level + 2), // We do this because we want users to only be able to add H3s and H4s (SEO).
			renderChildren(h, this.owner, this.data.content)
		);
	}
}
