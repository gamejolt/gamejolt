<script lang="ts" setup>
import { kBorderRadiusBase } from '../../_styles/variables';
import AppJolticon from '../jolticon/AppJolticon.vue';
import { kThemeBgActual, kThemeFg10, kThemePrimary } from '../theme/variables';

defineProps({
	progress: {
		type: Number,
		required: true,
	},
});
</script>

<template>
	<div
		:style="{
			display: `flex`,
			alignItems: `center`,
			gap: `4px`,
			position: `relative`,
			padding: `0 4px`,
		}"
	>
		<div
			:style="{
				flex: `auto`,
				paddingTop: `4px`,
				paddingBottom: `4px`,
			}"
		>
			<div
				:style="{
					width: `100%`,
					height: `4px`,
					position: `relative`,
					overflow: `hidden`,
					backgroundColor: kThemeFg10,
					borderRadius: kBorderRadiusBase.px,
				}"
			>
				<div
					:style="{
						position: `absolute`,
						left: 0,
						top: 0,
						bottom: 0,
						right: `${Math.max(0, Math.min(100, 100 - progress))}%`,
						backgroundColor: kThemePrimary,
					}"
				/>
			</div>
		</div>

		<AppJolticon
			v-if="progress >= 100"
			icon="star"
			:style="{
				color: kThemePrimary,
				fontSize: `16px`,
				margin: 0,
				position: `absolute`,
				left: `50%`,
				top: `50%`,
				transform: `translate(-50%, -50%)`,
				backgroundColor: kThemeBgActual,
				borderRadius: `50%`,
				padding: `2px`,
			}"
		/>
	</div>
</template>
