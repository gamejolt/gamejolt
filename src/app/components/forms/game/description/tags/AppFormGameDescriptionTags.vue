<script lang="ts" setup>
import { PropType, toRef, toRefs } from 'vue';
import { ContentDocument } from '../../../../../../_common/content/content-document';
import AppJolticon from '../../../../../../_common/jolticon/AppJolticon.vue';
import AppTagSuggestion from '../../../../../../_common/tag/suggestion/AppTagSuggestion.vue';
import { $gettext } from '../../../../../../_common/translate/translate.service';

const props = defineProps({
	tags: {
		type: Array as PropType<string[]>,
		required: true,
	},
	text: {
		type: String,
		required: true,
	},
	content: {
		type: Object as PropType<ContentDocument>,
		required: true,
	},
});

const emit = defineEmits({
	tag: (_tag: string) => true,
});

const { content } = toRefs(props);

const documents = toRef(() => [content.value]);
</script>

<template>
	<AppTagSuggestion :tags="tags" :text="text" :content="documents" @tag="emit('tag', $event)">
		<AppJolticon icon="tags" class="middle" />
		<strong>{{ $gettext(`Game Tags`) }}</strong>

		<p class="help-block">
			{{
				$gettext(
					`Tag your game to increase its visibility. It's recommended to include at least one of the listed tags, although you can add your own by putting a #hashtag in your description.`
				)
			}}
		</p>
	</AppTagSuggestion>
</template>
