import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { ContentObject } from '../../../content-object';
import { renderChildren } from '../AppContentViewerBaseComponent.vue';
import './code.styl';

@Options({})
export class AppContentViewerCodeBlock extends Vue {
	@Prop({ type: ContentObject })
	contentData!: ContentObject;

	render() {
		return this.renderDefault();
	}

	private renderDefault() {
		return h(
			'pre',
			{ class: 'content-viewer-code-block' },
			renderChildren(this.contentData.content)
		);
	}
}
