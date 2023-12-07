<script lang="ts" setup>
import { styleElevate, styleFlexCenter } from '../../_styles/mixins';
import AppJolticon from '../jolticon/AppJolticon.vue';
import { kThemeGjOverlayNotice } from '../theme/variables';
</script>

<template>
	<div
		:style="[
			styleFlexCenter(),
			{
				position: `absolute`,
				top: 0,
				left: 0,
				overflow: `hidden`,
				width: `64px`,
				height: `64px`,
				paddingRight: `32px`,
				paddingBottom: `32px`,
			},
		]"
	>
		<AppJolticon :style="{ position: `relative`, color: `white`, zIndex: 1 }" icon="check" />
		<div
			:style="[
				styleElevate(4),
				{
					position: `absolute`,
					width: `200%`,
					height: `20px`,
					backgroundColor: kThemeGjOverlayNotice,
					transform: `rotate(-45deg)`,
					zIndex: 0,
				},
			]"
		/>
	</div>
</template>
