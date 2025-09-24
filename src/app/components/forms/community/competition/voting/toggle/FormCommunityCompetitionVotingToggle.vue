<script lang="ts" setup>
import { nextTick, toRefs } from 'vue';
import {
	$setVotingEnabledOnCommunityCompetition,
	CommunityCompetitionModel,
} from '../../../../../../../_common/community/competition/competition.model';
import AppForm, {
	FormController,
	createForm,
	defineFormProps,
} from '../../../../../../../_common/form-vue/AppForm.vue';
import AppFormGroup from '../../../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlToggle from '../../../../../../../_common/form-vue/controls/AppFormControlToggle.vue';

export interface FormCommunityCompetitionVotingToggleInterface {
	form: FormController<CommunityCompetitionModel>;
}

const props = defineProps({
	...defineFormProps<CommunityCompetitionModel>(true),
});

const emit = defineEmits({
	'toggle-not-set-up': () => true,
});

const { model } = toRefs(props);

const form: FormController<CommunityCompetitionModel> = createForm({
	model,
	modelClass: CommunityCompetitionModel,
	modelSaveHandler: $setVotingEnabledOnCommunityCompetition,
});

async function onToggle() {
	if (!model.value!.isVotingSetUp) {
		emit('toggle-not-set-up');
		// No change to the actual model should be counted.
		await nextTick();
		form.changed = false;
	} else {
		// Submit toggle.
		await form.submit();
	}
}

defineExpose<FormCommunityCompetitionVotingToggleInterface>({ form });
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="is_voting_enabled" hide-label>
			<p class="help-block">
				<span>
					{{
						$gettext(
							`This allows members of the community to judge games by rating them after the jam.`
						)
					}}
					<br />
					{{ $gettext(`Enabling voting also lets you create and give out awards.`) }}
				</span>
			</p>

			<AppFormControlToggle :disabled="form.isProcessing" @changed="onToggle" />
		</AppFormGroup>
	</AppForm>
</template>
