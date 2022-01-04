import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { ContentObject } from '../../content-object';

@Options({})
export class AppContentViewerHorizontalRule extends Vue {
	@Prop({ type: ContentObject })
	contentData!: ContentObject;

	render() {
		return h('hr');
	}
}
