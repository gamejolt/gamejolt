import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import AppFormControlContent from 'game-jolt-frontend-lib/components/form-vue/control/content/content.vue';
import { BaseForm } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Component } from 'vue-property-decorator';

@Component({
	components: {
		AppFormControlContent,
	},
})
export default class FormCommunityDescription extends BaseForm<Community> {
	modelClass = Community;
	saveMethod = '$saveDescription' as '$saveDescription';
}
