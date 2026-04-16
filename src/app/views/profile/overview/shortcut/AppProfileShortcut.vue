<script lang="ts" setup>
import { RouterLink } from 'vue-router';

import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import { kThemeFg } from '../../../../../_common/theme/variables';
import { kFontSizeTiny } from '../../../../../_styles/variables';
import { ProfileQuickLink } from './AppProfileShortcuts.vue';

type Props = {
	item: ProfileQuickLink;
	width: number;
	tag?: string;
};
const { item, width, tag = 'div' } = defineProps<Props>();
</script>

<template>
	<component
		:is="item.location ? RouterLink : item.action ? 'a' : tag"
		:key="item.label"
		class="pressy"
		:style="{
			display: `flex`,
			flexDirection: `column`,
			alignItems: `center`,
			gap: `4px`,
			color: kThemeFg,
			width: `${width}px`,
			flex: `none`,
		}"
		:to="item.location"
		@click="item.action?.()"
	>
		<AppJolticon :icon="item.icon" :style="{ fontSize: `28px` }" />
		<div
			:style="{
				fontWeight: `bold`,
				fontSize: kFontSizeTiny.px,
			}"
		>
			{{ item.label }}
		</div>
	</component>
</template>
