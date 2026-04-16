<script lang="ts" setup>
import { computed, toRef } from 'vue';

import AppBackgroundSelector from '~common/background/AppBackgroundSelector.vue';
import { BackgroundModel } from '~common/background/background.model';
import { useForm } from '~common/form-vue/AppForm.vue';
import {
	createFormControl,
	FormControlEmits,
} from '~common/form-vue/AppFormControl.vue';
import { useFormGroup } from '~common/form-vue/AppFormGroup.vue';
import { FormValidator } from '~common/form-vue/validators';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';

type Props = {
	backgrounds: BackgroundModel[];
	tileSize?: number;
	hideEmptyTile?: boolean;
	/** Only shows when [disabled] is `true`. */
	disabledText?: string;
	tileGap?: number;
	disabled?: boolean;
	validators?: FormValidator[];
};
const {
	backgrounds,
	tileSize = 56,
	hideEmptyTile,
	disabledText,
	tileGap,
	disabled,
	validators = [],
} = defineProps<Props>();

const form = useForm()!;
const { name } = useFormGroup()!;

const { applyValue } = createFormControl<number | undefined>({
	initialValue: undefined,
	onChange: val => emit('changed', val),
	validators: toRef(() => validators),
});

const displayDisabledText = computed(() => {
	if (!disabled) {
		return undefined;
	}
	return disabledText;
});

const selectedBackgroundId = computed<number | null>(() => form.formModel[name.value] || null);
const currentBackground = computed(() => {
	if (!selectedBackgroundId.value) {
		return undefined;
	}

	return backgrounds.find((i: BackgroundModel) => i.id === selectedBackgroundId.value);
});

const emit = defineEmits<
	FormControlEmits & {
		backgroundChange: [item?: BackgroundModel];
	}
>();

function onSelect(item?: BackgroundModel) {
	applyValue(item?.id);
}
</script>

<template>
	<AppBackgroundSelector
		v-app-tooltip.touchable="displayDisabledText"
		:backgrounds="backgrounds"
		:background="currentBackground"
		:hide-empty-tile="hideEmptyTile"
		:tile-size="tileSize"
		:disabled="disabled"
		:tile-gap="tileGap"
		@background-change="onSelect"
	/>
</template>
