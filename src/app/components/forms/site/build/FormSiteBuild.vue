<script lang="ts" setup>
import { ref } from 'vue';

import { Api } from '../../../../../_common/api/api.service';
import AppForm, { createForm, FormController } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlUpload from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import { validateFilesize } from '../../../../../_common/form-vue/validators';
import { SiteBuildModel } from '../../../../../_common/site/build/build-model';
import { SiteModel } from '../../../../../_common/site/site-model';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';

type Props = {
	site: SiteModel;
};

const { site } = defineProps<Props>();

const maxFilesize = ref(0);

const form: FormController<SiteBuildModel> = createForm({
	modelClass: SiteBuildModel,
	warnOnDiscard: false,
	resetOnSubmit: true,
	loadUrl: `/web/dash/sites/upload-build/${site.id}`,
	onInit() {
		form.formModel.file = null;
		form.formModel.site_id = site.id;
	},
	onLoad(payload: any) {
		maxFilesize.value = payload.maxFilesize;
	},
	onSubmit() {
		return Api.sendRequest(
			`/web/dash/sites/upload-build/${site.id}`,
			{},
			{
				file: form.formModel.file,
				progress: event => {
					form.formModel._progress = event;
				},
			}
		);
	},
});

function onFileSelect() {
	form.submit();
}
</script>

<template>
	<AppForm class="form-dash-site-build" :controller="form">
		<AppFormGroup name="file" :hide-label="true">
			<p class="help-block">
				<AppTranslate
					:translate-params="{
						maxFilesize: maxFilesize / 1024 / 1024,
					}"
				>
					Static site uploads are currently capped at %{ maxFilesize }MB. Please upload a
					.zip file with an index.html file in the root of the folder.
				</AppTranslate>
			</p>

			<AppFormControlUpload
				:validators="[validateFilesize(maxFilesize)]"
				accept=".zip"
				:upload-link-label="$gettext(`Upload a .zip file.`)"
				@changed="onFileSelect"
			/>

			<AppFormControlErrors />
		</AppFormGroup>
	</AppForm>
</template>

<style lang="stylus" scoped>
.fill-offset .form-dash-site-build
	.link-muted
		color: $black

		&:hover
			text-decoration: underline
</style>
