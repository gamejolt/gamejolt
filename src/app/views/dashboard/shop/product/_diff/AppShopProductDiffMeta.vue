<script lang="ts" setup generic="T extends Record<string, any>">
import { PropType, toRefs } from 'vue';
import { kThemeFgMuted } from '../../../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { styleAbsoluteFill, styleLineClamp, styleWhen } from '../../../../../../_styles/mixins';
import { kFontSizeSmall } from '../../../../../../_styles/variables';

const props = defineProps({
	current: {
		type: Object as PropType<{ name: string } & T>,
		required: true,
	},
	other: {
		type: Object as PropType<{ name: string } & T>,
		default: undefined,
	},
	diffBackground: {
		type: String,
		default: undefined,
	},
	diffColor: {
		type: String,
		default: undefined,
	},
});

const { current, other } = toRefs(props);

function checkDiff(key: string): boolean {
	if (!other?.value) {
		return false;
	}
	return current.value[key] !== other.value?.[key];
}
</script>

<template>
	<div>
		<!-- TODO(creator-shops) I don't think I like this, takes up a ton of
		space and it's awkward. -->
		<div
			v-for="[key, value] in Object.entries(current as T)"
			:key="key"
			:style="[styleLineClamp(3), { fontSize: kFontSizeSmall.px, marginBottom: `8px` }]"
		>
			<div :style="{ fontWeight: `bold` }">
				<span v-app-tooltip.touchable="value">
					{{ key }}
				</span>
			</div>
			{{ ' ' }}
			<div v-if="value">
				<span :style="{ position: `relative`, zIndex: 1 }">
					{{ value }}
					<div
						:style="[
							styleAbsoluteFill({ zIndex: -1 }),
							styleWhen(checkDiff(key), {
								backgroundColor: diffBackground,
								color: diffColor,
								borderRadius: `2px`,
								opacity: 0.2,
							}),
						]"
					/>
				</span>
			</div>
			<div v-else :style="{ color: kThemeFgMuted, fontStyle: `italic` }">
				{{ $gettext(`none`) }}
			</div>
		</div>
	</div>
</template>
