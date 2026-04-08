<script lang="ts" setup>
import { toRef, watch } from 'vue';
import AppForm, { createForm } from '../../form-vue/AppForm.vue';
import AppFormControlErrors from '../../form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../form-vue/AppFormGroup.vue';
import AppFormControlMarkdown from '../../form-vue/controls/markdown/AppFormControlMarkdown.vue';
import { SiteContentBlockModel } from '../../site/content-block/content-block-model';

type Props = {
	model?: SiteContentBlockModel;
	mode: 'game' | 'user';
};
const { model, mode } = defineProps<Props>();

const form = createForm<SiteContentBlockModel>({
	warnOnDiscard: false,
	model: toRef(() => model),
	modelClass: SiteContentBlockModel,
});

watch(
	() => form.formModel.content_markdown,
	content => {
		if (model) {
			// Keep the source model in sync with form changes.
			// TODO: why are we setting on the model directly? Is this a bug?
			(model as SiteContentBlockModel).content_markdown = content;
		}
	}
);
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="content_markdown" :label="$gettext('Content')" hide-label>
			<AppFormControlMarkdown
				:markdown-mode="(mode + '-site') as 'game-site' | 'user-site'"
				media-item-type="sites-content-image"
			/>

			<AppFormControlErrors />
		</AppFormGroup>
	</AppForm>
</template>
