import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppContentEmbed from '../../components/embed/AppContentEmbed.vue';
import { ContentObject } from '../../content-object';

@Options({})
export class AppContentViewerEmbed extends Vue {
	@Prop({ type: ContentObject })
	contentData!: ContentObject;

	render() {
		if (!this.contentData.attrs.type || !this.contentData.attrs.source) {
			return h('div');
		}

		return h(AppContentEmbed, {
			type: this.contentData.attrs.type,
			source: this.contentData.attrs.source,
			isEditing: false,
		});
	}
}
