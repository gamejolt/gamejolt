<script lang="ts" setup>
import { kFontSizeH4, kFontSizeH6 } from '../../_styles/variables';
import AppJolticon from '../jolticon/AppJolticon.vue';
import { kThemeFgMuted } from '../theme/variables';
import { vAppTooltip } from '../tooltip/tooltip-directive';

defineProps({
	small: {
		type: Boolean,
	},
});
</script>

<template>
	<div class="clearfix">
		<component :is="small ? 'h6' : 'h4'" class="section-header" :style="{ display: `flex` }">
			<div :style="{ flex: `auto`, minWidth: 0 }">
				{{ $gettext(`Top supporters (last 30 days)`) }}
			</div>

			<div
				v-app-tooltip.touchable="
					$gettext(`Top supporters that placed a charged sticker in the last 30 days`)
				"
				:style="{
					marginLeft: `4px`,
					display: 'inline-block',
					minHeight: small ? kFontSizeH6.px : kFontSizeH4.px,
				}"
			>
				<AppJolticon
					:style="{
						fontSize: small ? kFontSizeH6.px : kFontSizeH4.px,
						color: kThemeFgMuted,
					}"
					icon="help-circle"
				/>
			</div>
		</component>
	</div>
</template>
