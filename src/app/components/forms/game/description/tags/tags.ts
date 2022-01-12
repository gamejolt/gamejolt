import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { ContentDocument } from '../../../../../../_common/content/content-document';
import AppTagSuggestion from '../../../../../../_common/tag/suggestion/suggestion.vue';

@Options({
	components: {
		AppTagSuggestion,
	},
})
export default class AppFormGameDescriptionTags extends Vue {
	@Prop(Array)
	tags!: string[];

	@Prop(String)
	text!: string;

	@Prop(Object)
	content!: ContentDocument;

	get documents() {
		return [this.content];
	}

	@Emit('tag')
	emitTag(_tag: string) {}
}
