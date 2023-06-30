<script lang="ts" setup>
import { CSSProperties, PropType } from 'vue';
import { styleChangeBg, styleFlexCenter } from '../../_styles/mixins';

defineProps({
	count: {
		type: Number,
		required: true,
	},
	current: {
		type: Number,
		required: true,
	},
	innerStyles: {
		type: Object as PropType<CSSProperties>,
		default: undefined,
	},
});
</script>

<template>
	<div
		:style="{
			...styleFlexCenter({ direction: 'row' }),
		}"
	>
		<div
			:style="{
				display: `inline-flex`,
				alignItems: `center`,
				flexWrap: `wrap`,
				gap: `4px`,
				...innerStyles,
			}"
		>
			<div
				v-for="i of count"
				:key="i"
				:style="{
					...styleChangeBg(current === i ? 'primary' : 'bg-subtle'),
					width: `6px`,
					height: `6px`,
					borderRadius: `50%`,
				}"
			/>
		</div>
	</div>
</template>
