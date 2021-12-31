import { Options, Vue } from 'vue-property-decorator';
import AppFormControl from '../../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlError from '../../../../../../_common/form-vue/AppFormControlError.vue';
import AppFormControlErrors from '../../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlRadio from '../../../../../../_common/form-vue/controls/AppFormControlRadio.vue';

@Options({
	components: {
		AppFormControl,
		AppFormGroup,
		AppFormControlError,
		AppFormControlErrors,
		AppFormControlRadio,
	},
})
export default class AppFormCommunityChannelPermissions extends Vue {
	get permissionPostingOptions() {
		return {
			all: this.$gettext('Everyone'),
			mods: this.$gettext('Collaborators only'),
		};
	}
}
