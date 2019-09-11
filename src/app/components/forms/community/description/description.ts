import { Component } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import AppFormControlContent from '../../../../../_common/form-vue/control/content/content.vue';
import { BaseForm } from '../../../../../_common/form-vue/form.service';

@Component({
	components: {
		AppFormControlContent,
	},
})
export default class FormCommunityDescription extends BaseForm<Community> {
	modelClass = Community;
	saveMethod = '$saveDescription' as '$saveDescription';
}
