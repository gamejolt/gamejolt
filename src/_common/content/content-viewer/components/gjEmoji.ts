import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { ContentObject } from '../../content-object';

@Options({})
export class AppContentViewerGJEmoji extends Vue {
	@Prop(ContentObject)
	contentData!: ContentObject;

	render() {
		return h('span', {
			class: 'emoji emoji-' + this.contentData.attrs.type,
			title: `:${this.contentData.attrs.type}:`,
		});
	}
}
