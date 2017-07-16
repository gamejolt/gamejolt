import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./build.html?style=./build.styl';

import { SiteBuild } from '../../../../../lib/gj-lib-client/components/site/build/build-model';
import { Site } from '../../../../../lib/gj-lib-client/components/site/site-model';
import {
	FormOnInit,
	BaseForm,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { FormOnSubmit } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { AppFormLoader } from '../../../../../lib/gj-lib-client/components/form-vue/loader/loader';
import { AppFormControlUpload } from '../../../../../lib/gj-lib-client/components/form-vue/control/upload/upload';

@View
@Component({
	components: {
		AppFormLoader,
		AppFormControlUpload,
	},
})
export class FormDashSiteBuild extends BaseForm<SiteBuild> implements FormOnInit, FormOnSubmit {
	modelClass = SiteBuild;
	resetOnSubmit = true;

	@Prop(Site) site: Site;

	maxFilesize = 0;
	progress = 0;

	onInit() {
		this.setField('file', null);
		this.setField('site_id', this.site.id);
	}

	onLoaded(payload: any) {
		this.maxFilesize = payload.maxFilesize;
	}

	onSubmit() {
		return Api.sendRequest(
			`/web/dash/sites/upload-build/${this.site.id}`,
			{},
			{
				file: this.formModel.file,
				progress: event => {
					if (!event) {
						return;
					}
					this.progress = event.loaded * 100 / event.total;
				},
			}
		);
	}
}

// require('./build.styl');

// SiteBuildFormFactory.$inject = ['Form'];
// export function SiteBuildFormFactory(Form: any) {
// 	const form = new Form({
// 		model: 'SiteBuild',
// 		template: require('./build.html'),
// 		resetOnSubmit: true,
// 	});

// 	form.scope.site = '<';

// 	form.onInit = function(scope: any) {
// 		scope.Loader = Loader;
// 		Loader.load('upload');

// 		scope.formModel.file = undefined;
// 		scope.formModel.site_id = scope.site.id;

// 		if (!scope.isLoaded) {
// 			Api.sendRequest(
// 				'/web/dash/sites/upload-build/' + scope.formModel.site_id
// 			).then((payload: any) => {
// 				scope.isLoaded = true;
// 				scope.maxFilesize = payload.maxFilesize;
// 			});
// 		}
// 	};

// 	form.onSubmit = function(scope: any) {
// 		return Api.sendRequest(
// 			`/web/dash/sites/upload-build/${scope.site.id}`,
// 			{},
// 			{
// 				file: scope.formModel.file,
// 				progress: event => (scope.formModel._progress = event),
// 			}
// 		);
// 	};

// 	return form;
// }
