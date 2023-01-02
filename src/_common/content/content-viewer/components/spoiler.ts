import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { ContentObject } from '../../content-object';
import { renderChildren } from './AppContentViewerBaseComponent.vue';

@Options({})
export class AppContentViewerSpoiler extends Vue {
	@Prop({ type: ContentObject })
	contentData!: ContentObject;

	render() {
		return h('blockquote', { class: 'spoiler' }, renderChildren(this.contentData.content));
	}
}
