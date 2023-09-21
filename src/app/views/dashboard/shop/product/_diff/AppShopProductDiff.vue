<script lang="ts" setup>
import { CSSProperties } from 'vue';
import AppJolticon from '../../../../../../_common/jolticon/AppJolticon.vue';
import { kThemeBgOffset } from '../../../../../../_common/theme/variables';
import { styleBorderRadiusLg, styleElevate } from '../../../../../../_styles/mixins';

const headerStyles: CSSProperties = {
	marginTop: 0,
	marginBottom: `4px`,
};

const baseStyles: CSSProperties = {
	display: `grid`,
	gridTemplateColumns: `1fr 36px 1fr`,
	gap: `16px`,
	alignItems: `center`,
	marginBottom: `16px`,
};

const sectionStyles: CSSProperties = {
	height: `100%`,
	display: `flex`,
	flexDirection: `column`,
};

const imgCardStyles: CSSProperties = {
	...styleBorderRadiusLg,
	...styleElevate(1),
	flex: `auto`,
	backgroundColor: kThemeBgOffset,
	padding: `24px`,
	display: `flex`,
	flexDirection: `column`,
};

const jolticonStyles: CSSProperties = {
	margin: 0,
	fontSize: `24px`,
	justifySelf: `center`,
	alignSelf: `center`,
};
</script>

<template>
	<div :style="baseStyles">
		<div :style="sectionStyles">
			<h6 :style="headerStyles">
				{{ $gettext(`Current version`) }}
			</h6>
			<div :style="imgCardStyles">
				<slot name="before" />
			</div>
		</div>

		<AppJolticon icon="arrow-right" :style="jolticonStyles" />

		<div :style="sectionStyles">
			<h6 :style="headerStyles">
				{{ $gettext(`New changes`) }}
			</h6>
			<div :style="imgCardStyles">
				<slot name="after" />
			</div>
		</div>
	</div>
</template>
