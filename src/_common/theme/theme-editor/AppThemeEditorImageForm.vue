<script lang="ts" setup>
import { ref } from 'vue';
import { Api, ApiProgressEvent } from '../../api/api.service';
import AppForm, { createForm, FormController } from '../../form-vue/AppForm.vue';
import AppFormControlErrors from '../../form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../form-vue/AppFormGroup.vue';
import AppFormControlUpload from '../../form-vue/controls/upload/AppFormControlUpload.vue';
import { validateFilesize, validateImageMaxDimensions } from '../../form-vue/validators';

interface FormModel {
	type: string;
	parent_id: number;
	file?: File;
	_progress: ApiProgressEvent | null;
}

type Props = {
	type: string;
	parentId: number;
};

const props = defineProps<Props>();

const emit = defineEmits<{
	submit: [formModel: FormModel, response: any];
}>();

const maxFilesize = ref(0);
const maxWidth = ref(0);
const maxHeight = ref(0);

const loadDataRef = ref<FormModel>();

const form: FormController<FormModel> = createForm({
	loadUrl: '/web/dash/media-items',
	loadData: loadDataRef,
	warnOnDiscard: false,
	resetOnSubmit: true,
	onInit() {
		form.formModel.type = props.type;
		form.formModel.parent_id = props.parentId;
		loadDataRef.value = form.formModel;
	},
	onLoad(response: { maxFilesize: number; maxWidth: number; maxHeight: number }) {
		maxFilesize.value = response.maxFilesize;
		maxWidth.value = response.maxWidth;
		maxHeight.value = response.maxHeight;
	},
	onSubmit() {
		return Api.sendRequest('/web/dash/media-items/add-one', form.formModel, {
			file: form.formModel.file,
			progress: event => (form.formModel._progress = event),
		});
	},
	onSubmitSuccess(response: any) {
		emit('submit', form.formModel, response);
	},
});

function submit() {
	form.submit();
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="file" :hide-label="true">
			<AppFormControlUpload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMaxDimensions({ width: maxWidth, height: maxHeight }),
				]"
				accept=".png,.jpg,.jpeg,.gif"
				:upload-link-label="$gettext(`Upload a PNG, JPG, or GIF image.`)"
				@changed="submit"
			/>

			<AppFormControlErrors />
		</AppFormGroup>
	</AppForm>
</template>
