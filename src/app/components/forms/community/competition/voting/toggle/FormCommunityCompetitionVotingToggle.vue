<script lang="ts" setup>
import { nextTick, toRef } from 'vue';

import {
	$setVotingEnabledOnCommunityCompetition,
	CommunityCompetitionModel,
} from '../../../../../../../_common/community/competition/competition.model';
import AppForm, {
	createForm,
	FormController,
} from '../../../../../../../_common/form-vue/AppForm.vue';
import AppFormGroup from '../../../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlToggle from '../../../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { TranslateDirective as vTranslate } from '../../../../../../../_common/translate/translate-directive';

const props = defineProps({
	model: {
		type: Object as () => CommunityCompetitionModel,
		default: undefined,
	},
});

const emit = defineEmits<{
	'toggle-not-set-up': [];
}>();

const form: FormController<CommunityCompetitionModel> = createForm({
	modelClass: CommunityCompetitionModel,
	modelSaveHandler: $setVotingEnabledOnCommunityCompetition,
	model: toRef(props, 'model'),
});

function setField<K extends keyof CommunityCompetitionModel>(
	field: K,
	value: CommunityCompetitionModel[K]
) {
	(form.formModel as any)[field] = value;
}

defineExpose({ setField });

async function onToggle() {
	if (!props.model!.isVotingSetUp) {
		emit('toggle-not-set-up');
		// No change to the actual model should be counted.
		await nextTick();
		form.changed = false;
	} else {
		// Submit toggle.
		await form.submit();
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="is_voting_enabled" hide-label>
			<p class="help-block">
				<span v-translate>
					This allows members of the community to judge games by rating them after the
					jam.<br />
					Enabling voting also lets you create and give out awards.
				</span>
			</p>

			<AppFormControlToggle :disabled="form.isProcessing" @changed="onToggle" />
		</AppFormGroup>
	</AppForm>
</template>
