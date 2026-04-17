<script lang="ts" setup>
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { kThemeGjOverlayNotice } from '~common/theme/variables';
</script>

<template>
	<div
		class="flex items-center justify-center"
		:style="{
			position: `absolute`,
			top: 0,
			left: 0,
			overflow: `hidden`,
			width: `64px`,
			height: `64px`,
			paddingRight: `32px`,
			paddingBottom: `32px`,
		}"
	>
		<AppJolticon class="relative z-[1] text-white" icon="check" />
		<div
			class="shadow-elevate-raw-4 elevate-transition"
			:style="{
				position: `absolute`,
				width: `200%`,
				height: `20px`,
				backgroundColor: kThemeGjOverlayNotice,
				transform: `rotate(-45deg)`,
				zIndex: 0,
			}"
		/>
	</div>
</template>
