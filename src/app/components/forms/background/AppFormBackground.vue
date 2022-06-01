<script lang="ts" setup>
import { computed, PropType, toRef, toRefs } from 'vue';
import AppBackgroundSelector from '../../../../_common/background/AppBackgroundSelector.vue';
import { Background } from '../../../../_common/background/background.model';
import { useForm } from '../../../../_common/form-vue/AppForm.vue';
import {
	createFormControl,
	defineFormControlEmits,
	defineFormControlProps,
} from '../../../../_common/form-vue/AppFormControl.vue';
import { useFormGroup } from '../../../../_common/form-vue/AppFormGroup.vue';

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
	...defineFormControlProps(),
});

const { backgrounds } = toRefs(props);

const form = useForm()!;
const { name } = useFormGroup()!;

const { applyValue } = createFormControl<number | undefined>({
	initialValue: undefined,
	onChange: val => emit('changed', val),
	validators: toRef(props, 'validators'),
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
		:backgrounds="backgrounds"
		:background="currentBackground"
		:hide-empty-tile="hideEmptyTile"
		:tile-size="tileSize"
		@background-change="onSelect"
	/>
</template>

<style lang="stylus" scoped>
$-padding = 12px
$-border-width = $border-width-large

.-items
	white-space: nowrap
	height: $-height
	display: inline-flex
	grid-gap: $-padding

.-item
	rounded-corners()
	overflow: hidden
	border-width: $-border-width
	border-style: none
	transition: border 0.1s ease

	&:hover
	&.-active
		theme-prop('border-color', 'link')
		border-style: solid
</style>
