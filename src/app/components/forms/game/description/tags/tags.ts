import AppTagSuggestion from 'game-jolt-frontend-lib/components/tag/suggestion/suggestion.vue'
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

@Component({
	components: {
		AppTagSuggestion,
	},
})
export default class AppFormGameDescriptionTags extends Vue {
	@Prop(Array)
	tags!: string[];

	@Prop(String)
	text!: string;

	@Emit('tag')
	emitTag(_tag: string) {}
}
