<script lang="ts" setup>
import { ref, toRef, toRefs } from 'vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { useForm } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../_common/form-vue/AppFormButton.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { useGameDashRouteController } from '../../../../views/dashboard/games/manage/manage.store';

const props = defineProps({
	disabled: {
		type: Boolean,
	},
});

const { disabled } = toRefs(props);
const gameDashStore = useGameDashRouteController();
const form = ref(useForm());

const isWizard = toRef(() => !gameDashStore || gameDashStore.isWizard.value);
const inForm = toRef(() => !!form.value);
const canProceed = toRef(() => !form.value || form.value.valid || disabled.value);

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
