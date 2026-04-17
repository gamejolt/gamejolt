<script lang="ts" setup>
import { Screen } from '~common/screen/screen-service';
import { kThemeBgOffset } from '~common/theme/variables';
</script>

<template>
	<div
		:style="{
			height: `100%`,
			display: `flex`,
			flexDirection: `column`,
		}"
	>
		<!-- Header -->
		<h6
			v-if="$slots.header"
			class="truncate"
			:style="{
				marginTop: 0,
				marginBottom: `4px`,
				minWidth: 0,
			}"
		>
			<slot name="header" />
		</h6>

		<!-- Card -->
		<div
			class="rounded-lg shadow-elevate-xs elevate-transition"
			:style="{
				backgroundColor: kThemeBgOffset,
				padding: Screen.isXs ? `12px` : `24px`,
			}"
		>
			<!-- Status/controls -->
			<!-- This needs to always show to maintain the same height between items. -->
			<div
				class="flex items-center justify-center"
				:style="{
					gap: `12px`,
					height: `40px`,
					marginBottom: `24px`,
				}"
			>
				<div v-if="$slots.status" class="relative flex-auto">
					<slot name="status" />
				</div>

				<div v-if="$slots.controls" class="relative flex-none">
					<slot name="controls" />
				</div>
			</div>

			<!-- View -->
			<div
				:style="{
					display: `flex`,
					flexDirection: `column`,
				}"
			>
				<slot />
			</div>
		</div>
	</div>
</template>
