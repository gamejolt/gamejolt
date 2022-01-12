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
