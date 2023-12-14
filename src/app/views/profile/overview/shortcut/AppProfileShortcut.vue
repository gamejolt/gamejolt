<script lang="ts" setup>
import { PropType } from 'vue';
import { RouterLink } from 'vue-router';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import { kThemeFg } from '../../../../../_common/theme/variables';
import { kFontSizeTiny } from '../../../../../_styles/variables';
import { ProfileQuickLink } from './AppProfileShortcuts.vue';

defineProps({
	item: {
		type: Object as PropType<ProfileQuickLink>,
		required: true,
	},
	tag: {
		type: String,
		default: 'div',
	},
});
</script>

<template>
	<component
		:is="item.location ? RouterLink : item.action ? 'a' : tag"
		:key="item.label"
		:style="{
			display: `flex`,
			flexDirection: `column`,
			alignItems: `center`,
			flex: 1,
			gap: `4px`,
			color: kThemeFg,
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
