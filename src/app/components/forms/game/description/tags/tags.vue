<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { ContentDocument } from '../../../../../../_common/content/content-document';
import AppTagSuggestion from '../../../../../../_common/tag/suggestion/AppTagSuggestion.vue';

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
	<AppTagSuggestion :tags="tags" :text="text" :content="documents" @tag="emitTag($event)">
		<AppJolticon icon="tags" class="middle" />
		<strong>
			<AppTranslate>Game Tags</AppTranslate>
		</strong>

		<p class="help-block">
			<AppTranslate>
				Tag your game to increase its visibility. It's recommended to include at least one
				of the listed tags, although you can add your own by putting a #hashtag in your
				description.
			</AppTranslate>
		</p>
	</AppTagSuggestion>
</template>
