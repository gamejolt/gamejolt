import { Component } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import AppFormControlContent from '../../../../../_common/form-vue/control/content/content.vue';
import { BaseForm, FormOnLoad } from '../../../../../_common/form-vue/form.service';

@Component({
	components: {
		AppFormControlContent,
	},
})
export default class FormCommunityDescription extends BaseForm<Community> implements FormOnLoad {
	modelClass = Community;
	saveMethod = '$saveDescription' as const;
	lengthLimit = 5_000;

	get loadUrl() {
		return `/web/dash/communities/description/save/${this.model!.id}`;
	}

	onLoad(payload: any) {
		this.lengthLimit = payload.lengthLimit;
	}
}
