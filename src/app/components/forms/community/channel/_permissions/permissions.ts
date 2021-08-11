import { Options, Vue } from 'vue-property-decorator';
import { AppFormControlError } from '../../../../../../_common/form-vue/control-errors/control-error';
import AppFormControlErrors from '../../../../../../_common/form-vue/control-errors/control-errors.vue';
import AppFormControl from '../../../../../../_common/form-vue/control/control.vue';
import AppFormControlRadio from '../../../../../../_common/form-vue/control/radio/radio.vue';
import AppFormGroup from '../../../../../../_common/form-vue/group/group.vue';

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
