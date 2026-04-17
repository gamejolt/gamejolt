<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { CommunityModel } from '~common/community/community.model';
import AppForm from '~common/form-vue/AppForm.vue';
import { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlRadio from '~common/form-vue/controls/AppFormControlRadio.vue';
import { validateMaxLength } from '~common/form-vue/validators';
import { getDatalistOptions } from '~common/settings/datalist-options.service';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';
import {
	getCommunityMovePostReasons,
	REASON_OTHER,
	REASON_SPAM,
} from '~common/user/action-reasons';

export type MovePostFormModel = {
	notifyUser: string;
	reasonType: string | null;
	reason: string | null;
};

type Props = {
	community: CommunityModel;
};

const { community } = defineProps<Props>();

const emit = defineEmits<{
	change: [form: MovePostFormModel];
}>();

const otherOptions = ref<string[]>([]);

const form: FormController<MovePostFormModel> = createForm<MovePostFormModel>({
	warnOnDiscard: false,
	onInit() {
		form.formModel.notifyUser = 'no';
		form.formModel.reasonType = REASON_SPAM;

		const options = getDatalistOptions('community-move-post', community.id.toString());
		otherOptions.value = options.getList();
	},
});

const notifyUserOptions = computed(() => ({
	no: $gettext(`No, do not notify the user.`),
	yes: $gettext(`Yes, notify the user.`),
	'yes-reason': $gettext(`Yes, notify the user and show them the following reason.`),
}));

const defaultReasons = computed(() => {
	return getCommunityMovePostReasons();
});

const shouldShowReasons = computed(() => {
	return form.formModel.notifyUser === 'yes-reason';
});

const showReasonOther = computed(() => {
	return shouldShowReasons.value && form.formModel.reasonType === REASON_OTHER;
});

watch(
	() => form.formModel,
	() => {
		emit('change', form.formModel);
	},
	{ deep: true }
);
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup
			name="notifyUser"
			:label="$gettext(`Do you want to notify the author that their post got moved?`)"
		>
			<div
				v-for="(optionDisplay, optionValue) in notifyUserOptions"
				:key="optionValue"
				class="radio"
			>
				<label>
					<AppFormControlRadio :value="optionValue" />
					{{ optionDisplay }}
				</label>
			</div>
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup v-if="shouldShowReasons" name="reasonType" :label="$gettext('Move reason')">
			<div v-for="(reasonDisplay, reason) in defaultReasons" :key="reason" class="radio">
				<label>
					<AppFormControlRadio :value="reason" />
					{{ reasonDisplay }}
				</label>
			</div>
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup v-if="showReasonOther" name="reason" hide-label>
			<div class="help-inline">
				<AppTranslate>
					Enter other move reason. This is shown to the post author.
				</AppTranslate>
			</div>
			<AppFormControl
				type="text"
				html-list-id="move-post-reasons-list"
				:validators="[validateMaxLength(100)]"
			/>
			<datalist id="move-post-reasons-list">
				<option v-for="optionStr of otherOptions" :key="optionStr" :value="optionStr" />
			</datalist>
			<AppFormControlErrors />
		</AppFormGroup>
	</AppForm>
</template>
