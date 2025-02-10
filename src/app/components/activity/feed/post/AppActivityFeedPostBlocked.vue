<script lang="ts" setup>
import { computed, CSSProperties } from 'vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { kFontSizeSmall } from '../../../../../_styles/variables';
import { stylePostFeedItem } from '../../../post/post-styles';

defineProps<{ username: string }>();

const emit = defineEmits<{ show: [] }>();

const itemStyles = computed(() => {
	return {
		...stylePostFeedItem({ isHovered: false }),
		display: `flex`,
		justifyContent: `space-between`,
		alignItems: `center`,
		paddingTop: `8px`,
		paddingBottom: `8px`,
		margin: 0,
		fontSize: kFontSizeSmall.px,
		cursor: `default`,
	} satisfies CSSProperties;
});
</script>

<template>
	<div :style="itemStyles">
		<span v-translate="{ username }">
			{{ $gettext(`Hidden post by blocked user @%{ username }.`, { username }) }}
		</span>
		<AppButton trans @click="emit('show')">
			{{ $gettext(`Show`) }}
		</AppButton>
	</div>
</template>
