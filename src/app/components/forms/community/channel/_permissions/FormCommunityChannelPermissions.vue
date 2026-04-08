<script lang="ts" setup>
import { computed } from 'vue';

import AppFormControlErrors from '../../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlRadio from '../../../../../../_common/form-vue/controls/AppFormControlRadio.vue';
import AppTranslate from '../../../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../../../_common/translate/translate.service';

const permissionPostingOptions = computed(() => ({
	all: $gettext('Everyone'),
	mods: $gettext('Collaborators only'),
}));
</script>

<template>
	<AppFormGroup name="permission_posting" :label="$gettext('Channel Posting Permissions')">
		<div class="help-inline">
			<AppTranslate>Choose who can post to this channel.</AppTranslate>
		</div>
		<div
			v-for="(permissionDisplay, permission) of permissionPostingOptions"
			:key="permission"
			class="radio"
		>
			<label>
				<AppFormControlRadio :value="permission" />
				{{ permissionDisplay }}
			</label>
		</div>
		<AppFormControlErrors />
	</AppFormGroup>
</template>
