import { Options } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import AppFormControlContent from '../../../../../_common/form-vue/controls/AppFormControlContent.vue';
import { BaseForm, FormOnLoad } from '../../../../../_common/form-vue/form.service';
import {
	validateContentMaxLength,
	validateContentNoActiveUploads,
	validateContentRequired,
} from '../../../../../_common/form-vue/validators';

@Options({
	components: {
		AppFormControlContent,
	},
})
export default class FormCommunityDescription extends BaseForm<Community> implements FormOnLoad {
	modelClass = Community;
	saveMethod = '$saveDescription' as const;
	lengthLimit = 5_000;

	readonly validateContentRequired = validateContentRequired;
	readonly validateContentMaxLength = validateContentMaxLength;
	readonly validateContentNoActiveUploads = validateContentNoActiveUploads;

	get loadUrl() {
		return `/web/dash/communities/description/save/${this.model!.id}`;
	}

	onLoad(payload: any) {
		this.lengthLimit = payload.lengthLimit;
	}
}
