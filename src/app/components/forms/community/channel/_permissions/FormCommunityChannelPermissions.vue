<script lang="ts" setup>
import { computed } from 'vue';

import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlRadio from '~common/form-vue/controls/AppFormControlRadio.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

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
