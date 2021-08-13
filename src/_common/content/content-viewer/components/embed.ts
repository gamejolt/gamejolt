import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppContentEmbed from '../../components/embed/embed.vue';
import { ContentObject } from '../../content-object';
import { ContentOwner } from '../../content-owner';

@Options({})
export class AppContentViewerEmbed extends Vue {
	@Prop(ContentObject)
	contentData!: ContentObject;

	@Prop(Object)
	owner!: ContentOwner;

	render() {
		if (!this.contentData.attrs.type || !this.contentData.attrs.source) {
			return h('div');
		}

		return h(AppContentEmbed, {
			type: this.contentData.attrs.type,
			source: this.contentData.attrs.source,
			isEditing: false,
			owner: this.owner,
		});
	}
}
