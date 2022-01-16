<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../api/api.service';
import AppFormControlUpload from '../../form-vue/controls/upload/AppFormControlUpload.vue';
import { BaseForm, FormOnLoad, FormOnSubmit } from '../../form-vue/form.service';

interface FormModel {
	type: string;
	parent_id: number;
	file?: File;
	_progress: ProgressEvent | null;
}

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormControlUpload,
	},
})
export default class FormThemeEditorImage
	extends mixins(Wrapper)
	implements FormOnLoad, FormOnSubmit
{
	@Prop(String) type!: string;
	@Prop(Number) parentId!: number;

	maxFilesize = 0;
	maxWidth = 0;
	maxHeight = 0;

	get loadUrl() {
		return `/web/dash/media-items`;
	}

	get loadData() {
		return this.formModel;
	}

	created() {
		this.form.warnOnDiscard = false;
		this.form.resetOnSubmit = true;
	}

	onInit() {
		this.setField('type', this.type);
		this.setField('parent_id', this.parentId);
	}

	onLoad(response: any) {
		this.maxFilesize = response.maxFilesize;
		this.maxWidth = response.maxWidth;
		this.maxHeight = response.maxHeight;
	}

	submit() {
		this.form.submit();
	}

	onSubmit() {
		return Api.sendRequest('/web/dash/media-items/add-one', this.formModel, {
			file: this.formModel.file,
			progress: event => this.setField('_progress', event),
		});
	}
}
</script>

<template>
	<app-form :controller="form">
		<app-form-group name="file" :hide-label="true">
			<app-form-control-upload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMaxDimensions({ width: maxWidth, height: maxHeight }),
				]"
				accept=".png,.jpg,.jpeg,.gif"
				:upload-link-label="$gettext(`Upload a PNG, JPG, or GIF image.`)"
				@changed="submit"
			/>

			<app-form-control-errors />
		</app-form-group>
	</app-form>
</template>
