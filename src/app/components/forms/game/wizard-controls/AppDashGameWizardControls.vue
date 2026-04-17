<script lang="ts" setup>
import { ref, toRef } from 'vue';

import { useGameDashRouteController } from '~app/views/dashboard/games/manage/manage.store';
import AppButton from '~common/button/AppButton.vue';
import { useForm } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	disabled?: boolean;
};
const { disabled } = defineProps<Props>();

const gameDashStore = useGameDashRouteController();
const form = ref(useForm());

const isWizard = toRef(() => !gameDashStore || gameDashStore.isWizard.value);
const inForm = toRef(() => !!form.value);
const canProceed = toRef(() => !form.value || form.value.valid || disabled);

async function next(_e: Event, formResult?: boolean) {
	if (!canProceed.value || formResult === false) {
		return;
	}

	gameDashStore?.wizardNext();
}
</script>

<template>
	<div>
		<div v-if="isWizard">
			<hr />

			<div class="pull-right">
				<AppFormButton v-if="inForm" :disabled="!canProceed" @after-submit="next">
					{{ $gettext(`Save & Next`) }}
				</AppFormButton>
				<AppButton v-else :disabled="!canProceed" @click="next">
					{{ $gettext(`Next Step`) }}
				</AppButton>
			</div>
		</div>
		<div v-else>
			<slot />
		</div>
	</div>
</template>
