import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./build.html?style=./build.styl';

import { SiteBuild } from '../../../../../lib/gj-lib-client/components/site/build/build-model';
import { Site } from '../../../../../lib/gj-lib-client/components/site/site-model';
import {
	BaseForm,
	FormOnInit,
	FormOnSubmit,
	FormOnLoad,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { AppFormControlUpload } from '../../../../../lib/gj-lib-client/components/form-vue/control/upload/upload';

@View
@Component({
	components: {
		AppFormControlUpload,
	},
})
export class FormDashSiteBuild extends BaseForm<SiteBuild>
	implements FormOnInit, FormOnLoad, FormOnSubmit {
	modelClass = SiteBuild;
	resetOnSubmit = true;
	warnOnDiscard = false;

	@Prop(Site) site: Site;

	maxFilesize = 0;
	progress = 0;

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
