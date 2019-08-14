import { ContentDocument } from '../../../../../_common/content/content-document';
import AppTagSuggestion from '../../../../../_common/tag/suggestion/suggestion.vue';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

@Component({
	components: {
		AppTagSuggestion,
	},
})
export default class AppFormPostTags extends Vue {
	@Prop(Array)
	tags!: string[];

	@Prop(Array)
	content!: ContentDocument[];

	@Emit('tag')
	emitTag(_tag: string) {}
}
