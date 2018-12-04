import View from '!view!./tags.html';
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

	@Emit('tag')
	emitTag(_tag: string) {}
}
