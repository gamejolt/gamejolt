<script lang="ts" setup>
import { CSSProperties, PropType, toRefs } from 'vue';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
import { kThemeFg10 } from '../../../../_common/theme/variables';
import { styleLineClamp } from '../../../../_styles/mixins';
import { kFontSizeSmall } from '../../../../_styles/variables';

export interface ShopItemStates {
	active?: boolean;
	inReview?: boolean;
	rejected?: boolean;
}

const props = defineProps({
	name: {
		type: [String, null] as PropType<string | null>,
		required: true,
	},
});

const { name } = toRefs(props);

const nameStyles: CSSProperties = {
	...styleLineClamp(2),
	marginTop: `4px`,
	fontWeight: 600,
	fontSize: kFontSizeSmall.px,
	textAlign: `center`,
};
</script>

<template>
	<div :style="{ width: `100%` }">
		<slot name="img">
			<AppAspectRatio
				:ratio="1"
				:style="{ borderRadius: `50%`, backgroundColor: kThemeFg10 }"
			/>
		</slot>

		<slot />

		<div v-if="name" :style="nameStyles">
			{{ name }}
		</div>
	</div>
</template>
