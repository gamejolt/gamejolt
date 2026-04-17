<script lang="ts" setup>
import { nextTick, toRef } from 'vue';

import {
	$setVotingEnabledOnCommunityCompetition,
	CommunityCompetitionModel,
} from '~common/community/competition/competition.model';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlToggle from '~common/form-vue/controls/AppFormControlToggle.vue';
import { TranslateDirective as vTranslate } from '~common/translate/translate-directive';

type FormModel = CommunityCompetitionModel;

type Props = {
	model?: CommunityCompetitionModel;
};
const { model } = defineProps<Props>();

const emit = defineEmits<{
	'toggle-not-set-up': [];
}>();

const form: FormController<FormModel> = createForm<FormModel>({
	modelClass: CommunityCompetitionModel,
	modelSaveHandler: $setVotingEnabledOnCommunityCompetition,
	model: toRef(() => model),
});

function setField<K extends keyof CommunityCompetitionModel>(
	field: K,
	value: CommunityCompetitionModel[K]
) {
	(form.formModel as any)[field] = value;
}

defineExpose({ setField });

async function onToggle() {
	if (!model!.isVotingSetUp) {
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
