<script lang="ts" setup>
import { CSSProperties, computed } from 'vue';
import AppJolticon from '../../../../../../_common/jolticon/AppJolticon.vue';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { kThemeBgOffset } from '../../../../../../_common/theme/variables';
import {
	styleBorderRadiusLg,
	styleElevate,
	styleTextOverflow,
} from '../../../../../../_styles/mixins';

const shouldShowArrow = computed(() => Screen.isDesktop);

const baseStyles = computed<CSSProperties>(() => {
	const middleCol = shouldShowArrow.value ? ' 36px ' : ' ';
	const columns = ['minmax(0, 1fr)', 'minmax(0, 1fr)'];
	return {
		display: `grid`,
		gridTemplateColumns: columns.join(middleCol),
		gap: `16px`,
		alignItems: `center`,
		marginBottom: `16px`,
	};
});

const headerStyles: CSSProperties = {
	...styleTextOverflow,
	marginTop: 0,
	marginBottom: `4px`,
	minWidth: 0,
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

		<AppJolticon v-if="shouldShowArrow" icon="arrow-right" :style="jolticonStyles" />

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
