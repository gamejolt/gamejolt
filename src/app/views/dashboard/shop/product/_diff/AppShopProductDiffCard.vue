<script lang="ts" setup>
import { Screen } from '../../../../../../_common/screen/screen-service';
import { kThemeBgOffset } from '../../../../../../_common/theme/variables';
import {
	styleBorderRadiusLg,
	styleElevate,
	styleFlexCenter,
	styleTextOverflow,
	styleWhen,
} from '../../../../../../_styles/mixins';
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
			:style="{
				...styleTextOverflow,
				marginTop: 0,
				marginBottom: `4px`,
				minWidth: 0,
			}"
		>
			<slot name="header" />
		</h6>

		<!-- Card -->
		<div
			:style="{
				...styleBorderRadiusLg,
				...styleElevate(1),
				backgroundColor: kThemeBgOffset,
				padding: `24px`,
				...styleWhen(Screen.isXs, {
					padding: `12px`,
				}),
			}"
		>
			<!-- Status/controls -->
			<!-- This needs to always show to maintain the same height between items. -->
			<div
				:style="{
					...styleFlexCenter(),
					gap: `12px`,
					height: `40px`,
					marginBottom: `24px`,
				}"
			>
				<div v-if="$slots.status" :style="{ flex: `auto`, position: `relative` }">
					<slot name="status" />
				</div>

				<div v-if="$slots.controls" :style="{ flex: `none`, position: `relative` }">
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
