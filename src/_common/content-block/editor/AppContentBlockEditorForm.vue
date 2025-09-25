<script lang="ts" setup>
import { toRef, watch } from 'vue';
import AppForm, { createForm, FormController } from '../../form-vue/AppForm.vue';
import AppFormControlErrors from '../../form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../form-vue/AppFormGroup.vue';
import AppFormControlMarkdown from '../../form-vue/controls/markdown/AppFormControlMarkdown.vue';
import { SiteContentBlockModel } from '../../site/content-block/content-block-model';

type Props = {
	model?: SiteContentBlockModel;
	mode: 'game' | 'user';
};

const props = defineProps<Props>();

const form: FormController<SiteContentBlockModel> = createForm({
	model: toRef(props, 'model'),
	modelClass: SiteContentBlockModel,
	warnOnDiscard: false,
});

watch(
	() => form.formModel.content_markdown,
	content => {
		if (props.model) {
			// TODO: why are we setting on the model directly? Is this a bug?
			props.model.content_markdown = content!;
		}
	}
);
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="content_markdown" :label="$gettext('Content')" hide-label>
			<AppFormControlMarkdown
				:markdown-mode="`${mode}-site`"
				media-item-type="sites-content-image"
			/>

			<AppFormControlErrors />
		</AppFormGroup>
	</AppForm>
</template>
