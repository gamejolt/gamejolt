<script lang="ts" setup>
import { computed, PropType, toRef, toRefs } from 'vue';
import AppBackgroundSelector from '../../background/AppBackgroundSelector.vue';
import { Background } from '../../background/background.model';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import { useForm } from '../AppForm.vue';
import {
	createFormControl,
	defineFormControlEmits,
	defineFormControlProps,
} from '../AppFormControl.vue';
import { useFormGroup } from '../AppFormGroup.vue';

const props = defineProps({
	backgrounds: {
		type: Array as PropType<Array<Background>>,
		required: true,
	},
	tileSize: {
		type: Number,
		default: 56,
		validator: val => typeof val === 'number' && val > 0,
	},
	hideEmptyTile: {
		type: Boolean,
	},
	/** Only shows when [disabled] is `true`. */
	disabledText: {
		type: String,
		default: undefined,
	},
	...defineFormControlProps(),
});

const { backgrounds, disabledText, disabled } = toRefs(props);

const form = useForm()!;
const { name } = useFormGroup()!;

const { applyValue } = createFormControl<number | undefined>({
	initialValue: undefined,
	onChange: val => emit('changed', val),
	validators: toRef(props, 'validators'),
});

const displayDisabledText = computed(() => {
	if (!disabled.value) {
		return undefined;
	}
	return disabledText?.value;
});

const selectedBackgroundId = computed<number | null>(() => form.formModel[name.value] || null);
const currentBackground = computed(() => {
	if (!selectedBackgroundId.value) {
		return undefined;
	}

	return backgrounds.value.find(i => i.id === selectedBackgroundId.value);
});

const emit = defineEmits({
	backgroundChange: (_item?: Background) => true,
	...defineFormControlEmits(),
});

function onSelect(item?: Background) {
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
		@background-change="onSelect"
	/>
</template>
