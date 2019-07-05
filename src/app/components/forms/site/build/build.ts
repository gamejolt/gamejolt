import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import AppFormControlUpload from 'game-jolt-frontend-lib/components/form-vue/control/upload/upload.vue';
import AppForm from 'game-jolt-frontend-lib/components/form-vue/form';
import {
	BaseForm,
	FormOnInit,
	FormOnLoad,
	FormOnSubmit,
} from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { SiteBuild } from 'game-jolt-frontend-lib/components/site/build/build-model';
import { Site } from 'game-jolt-frontend-lib/components/site/site-model';
import { Component, Prop } from 'vue-property-decorator';

@Component({
	components: {
		AppFormControlUpload,
	},
})
export default class FormDashSiteBuild extends BaseForm<SiteBuild>
	implements FormOnInit, FormOnLoad, FormOnSubmit {
	modelClass = SiteBuild;
	resetOnSubmit = true;
	warnOnDiscard = false;

	@Prop(Site) site!: Site;

	maxFilesize = 0;
	progress = 0;

	$refs!: {
		form: AppForm;
	};

	get loadUrl() {
		return `/web/dash/sites/upload-build/${this.site.id}`;
	}

	onInit() {
		this.setField('file', null);
		this.setField('site_id', this.site.id);
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
	}

	onFileSelect() {
		this.$refs.form.submit();
	}

	onSubmit() {
		// Whyyyyy ⬊
		console.log('whyyyy');
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
