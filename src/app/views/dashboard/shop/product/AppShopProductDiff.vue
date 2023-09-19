<script lang="ts" setup>
import { CSSProperties } from 'vue';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import { kThemeBgOffset } from '../../../../../_common/theme/variables';
import { styleBorderRadiusLg, styleElevate } from '../../../../../_styles/mixins';

const gridStyles: CSSProperties = {
	display: `grid`,
	gridTemplateColumns: `1fr 36px 1fr`,
	gap: `16px`,
	alignItems: `center`,
	marginBottom: `16px`,
};

const imgCardStyles: CSSProperties = {
	...styleBorderRadiusLg,
	...styleElevate(1),
	display: `grid`,
	grid: `minmax(64px, 240px) / minmax(64px, 240px)`,
	justifyContent: `center`,
	alignItems: `center`,
	backgroundColor: kThemeBgOffset,
	padding: `24px`,
};

const jolticonStyles: CSSProperties = {
	margin: 0,
	fontSize: `24px`,
	justifySelf: `center`,
	alignSelf: `center`,
};
</script>

<template>
	<div :style="gridStyles">
		<div :style="imgCardStyles">
			<slot name="before" />
		</div>

		<AppJolticon icon="arrow-right" :style="jolticonStyles" />

		<div :style="imgCardStyles">
			<slot name="after" />
		</div>
	</div>
</template>
