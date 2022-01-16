<script lang="ts">
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
</script>

<template>
	<app-form-group name="permission_posting" :label="$gettext('Channel Posting Permissions')">
		<div class="help-inline">
			<translate>Choose who can post to this channel.</translate>
		</div>
		<div
			v-for="(permissionDisplay, permission) of permissionPostingOptions"
			:key="permission"
			class="radio"
		>
			<label>
				<app-form-control-radio :value="permission" />
				{{ permissionDisplay }}
			</label>
		</div>
		<app-form-control-errors />
	</app-form-group>
</template>
