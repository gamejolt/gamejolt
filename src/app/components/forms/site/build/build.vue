<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import AppFormControlUpload from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import { BaseForm, FormOnLoad, FormOnSubmit } from '../../../../../_common/form-vue/form.service';
import { SiteBuild } from '../../../../../_common/site/build/build-model';
import { Site } from '../../../../../_common/site/site-model';

class Wrapper extends BaseForm<SiteBuild> {}

@Options({
	components: {
		AppFormControlUpload,
	},
})
export default class FormDashSiteBuild extends mixins(Wrapper) implements FormOnLoad, FormOnSubmit {
	modelClass = SiteBuild;

	@Prop(Object) site!: Site;

	maxFilesize = 0;
	progress = 0;

	get loadUrl() {
		return `/web/dash/sites/upload-build/${this.site.id}`;
	}

	created() {
		this.form.warnOnDiscard = false;
		this.form.resetOnSubmit = true;
	}

	onInit() {
		this.setField('file', null);
		this.setField('site_id', this.site.id);
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
	}

	onFileSelect() {
		this.form.submit();
	}

	onSubmit() {
		return Api.sendRequest(
			`/web/dash/sites/upload-build/${this.site.id}`,
			{},
			{
				file: this.formModel.file,
				progress: event => {
					this.setField('_progress', event);
				},
			}
		);
	}
}
</script>

<template>
	<app-form class="form-dash-site-build" :controller="form">
		<app-form-group name="file" :hide-label="true">
			<p class="help-block">
				<translate
					:translate-params="{
						maxFilesize: maxFilesize / 1024 / 1024,
					}"
				>
					Static site uploads are currently capped at %{ maxFilesize }MB. Please upload a
					.zip file with an index.html file in the root of the folder.
				</translate>
			</p>

			<app-form-control-upload
				:validators="[validateFilesize(maxFilesize)]"
				accept=".zip"
				:upload-link-label="$gettext(`Upload a .zip file.`)"
				@changed="onFileSelect"
			/>

			<app-form-control-errors />
		</app-form-group>
	</app-form>
</template>

<style lang="stylus" scoped>
.fill-offset .form-dash-site-build
	.link-muted
		color: $black

		&:hover
			text-decoration: underline
</style>
