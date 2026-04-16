<script lang="ts" setup>
import { computed } from 'vue';

import AppJolticon, { Jolticon } from '../jolticon/AppJolticon.vue';
import AppTranslate from '../translate/AppTranslate.vue';
import { useForm } from './AppForm.vue';
import { useFormGroup } from './AppFormGroup.vue';

type Props = {
	hideLabel?: boolean;
	labelClass?: string;
	icon?: Jolticon;
	small?: boolean;
	tinyLabelMargin?: boolean;
};
const { hideLabel, labelClass, icon, small, tinyLabelMargin } = defineProps<Props>();

const form = useForm()!;
const { name, optional } = useFormGroup()!;

const labelClasses = computed(() => [
	labelClass,
	{ 'sr-only': hideLabel },
	small ? '-small-label' : undefined,
	tinyLabelMargin ? '-tiny-margin' : undefined,
]);
</script>

<template>
	<label class="control-label" :class="labelClasses" :for="`${form.name}-${name}`">
		<AppJolticon v-if="icon" class="-icon" :icon="icon" />
		<slot />
		<span v-if="optional" class="-optional-tag">
			<AppTranslate>(optional)</AppTranslate>
		</span>
	</label>
</template>

<style lang="stylus" scoped>
.-optional-tag
	color: var(--theme-fg-muted)
	font-weight: normal

.-optional-tag
	margin-left: 8px

.-icon
	color: var(--theme-fg-muted)
	margin-right: 8px

.control-label.-small-label
	display: flex
	font-size: 13px
	font-weight: normal
	margin-bottom: 8px
	align-items: center

	.-optional-tag
		font-size: 11px

.control-label.-tiny-margin
	margin-bottom: 4px
</style>
