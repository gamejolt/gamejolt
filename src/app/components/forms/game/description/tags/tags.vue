<script lang="ts">
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
</script>

<template>
	<app-tag-suggestion :tags="tags" :text="text" :content="documents" @tag="emitTag($event)">
		<app-jolticon icon="tags" class="middle" />
		<strong>
			<translate>Game Tags</translate>
		</strong>

		<p class="help-block">
			<translate>
				Tag your game to increase its visibility. It's recommended to include at least one of the
				listed tags, although you can add your own by putting a #hashtag in your description.
			</translate>
		</p>
	</app-tag-suggestion>
</template>
