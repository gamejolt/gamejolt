import { ContentDocument } from 'game-jolt-frontend-lib/components/content/content-document';
import AppTagSuggestion from 'game-jolt-frontend-lib/components/tag/suggestion/suggestion.vue';
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
