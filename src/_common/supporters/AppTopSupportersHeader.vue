<script lang="ts" setup>
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';

type Props = {
	small?: boolean;
};
defineProps<Props>();
</script>

<template>
	<div class="clearfix">
		<component :is="small ? 'h6' : 'h4'" class="section-header flex">
			<div class="min-w-0 flex-auto">
				{{ $gettext(`Top supporters (last 30 days)`) }}
			</div>

			<div
				v-app-tooltip.touchable="
					$gettext(`Top supporters that placed a charged sticker in the last 30 days`)
				"
				class="ml-[4px] inline-block"
				:class="small ? 'min-h-[13px]' : 'min-h-[18px]'"
			>
				<AppJolticon
					class="text-fg-muted"
					:class="small ? 'text-[13px]' : 'text-[18px]'"
					icon="help-circle"
				/>
			</div>
		</component>
	</div>
</template>
