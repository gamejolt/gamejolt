import { Component } from 'vue-property-decorator';
import View from '!view!./header.html';

import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { AppFormControlUpload } from '../../../../lib/gj-lib-client/components/form-vue/control/upload/upload';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppForm } from '../../../../lib/gj-lib-client/components/form-vue/form';
import {
	BaseForm,
	FormOnLoad,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';

@View
@Component({
	components: {
		AppFormControlUpload,
		AppJolticon,
	},
})
export class FormUserHeader extends BaseForm<User> implements FormOnLoad {
	modelClass = User;
	saveMethod: '$saveHeader' = '$saveHeader';

	maxFilesize = 0;
	minSize = 0;
	maxSize = 0;
	minAspectRatio = 0;
	maxAspectRatio = 0;

	$refs: {
		form: AppForm;
	};

	get loadUrl() {
		return `/web/dash/header/save`;
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.minSize = payload.minSize;
		this.maxSize = payload.maxSize;
		this.minAspectRatio = payload.minAspectRatio;
		this.maxAspectRatio = payload.maxAspectRatio;
	}

	headerSelected() {
		if (this.formModel.file) {
			this.$refs.form.submit();
		}
	}
}
