import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { ContentObject } from '../../content-object';
import { ContentOwner } from '../../content-owner';
import { renderChildren } from './base-component';

@Options({})
export class AppContentViewerSpoiler extends Vue {
	@Prop(ContentObject)
	contentData!: ContentObject;

	@Prop(Object)
	owner!: ContentOwner;

	render() {
		return h(
			'blockquote',
			{ class: 'spoiler' },
			renderChildren(this.owner, this.contentData.content)
		);
	}
}
