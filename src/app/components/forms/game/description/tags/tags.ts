import View from '!view!./tags.html';
import { ContentContainer } from 'game-jolt-frontend-lib/components/content/content-container';
import { AppTagSuggestion } from 'game-jolt-frontend-lib/components/tag/suggestion/suggestion';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

@View
@Component({
	components: {
		AppTagSuggestion,
	},
})
export class AppFormGameDescriptionTags extends Vue {
	@Prop(Array)
	tags!: string[];

	@Prop(String)
	text!: string;

	@Prop(ContentContainer)
	content!: ContentContainer;

	@Emit('tag')
	emitTag(_tag: string) {}
}
