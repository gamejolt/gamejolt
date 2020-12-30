import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../../utils/vue';
import { Community } from '../../../../../../_common/community/community.model';
import { AppFormControlError } from '../../../../../../_common/form-vue/control-errors/control-error';
import AppFormControlErrors from '../../../../../../_common/form-vue/control-errors/control-errors.vue';
import AppFormControl from '../../../../../../_common/form-vue/control/control.vue';
import AppFormGroup from '../../../../../../_common/form-vue/group/group.vue';

@Component({
	components: {
		AppFormControl,
		AppFormGroup,
		AppFormControlError,
		AppFormControlErrors,
	},
})
export default class AppFormCommunityChannelTitle extends Vue {
	@Prop(propRequired(Community)) community!: Community;
	@Prop(propOptional(Boolean, false)) hideLabel!: boolean;
}
