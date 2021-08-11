import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { ContentObject } from '../../content-object';

@Options({})
export class AppContentViewerGJEmoji extends Vue {
	@Prop(ContentObject)
	data!: ContentObject;

	render() {
		return h('span', {
			class: 'emoji emoji-' + this.data.attrs.type,
			attrs: { title: `:${this.data.attrs.type}:` },
		});
	}
}
