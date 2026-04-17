<script lang="ts" setup>
import { computed } from 'vue';

import { PostOverlayTextStyles } from '~app/components/post/post-styles';
import { formatNumber } from '~common/filters/number';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import { useCommonStore } from '~common/store/common-store';
import AppTranslate from '~common/translate/AppTranslate.vue';

type Props = {
	post: FiresidePostModel;
	overlay?: boolean;
};
const { post, overlay } = defineProps<Props>();
const { user } = useCommonStore();

const hasPerms = computed(() => {
	if (!user.value) {
		return false;
	}
	return post.isEditableByUser(user.value);
});

const shouldShowStats = computed(() => {
	return hasPerms.value && post.isActive && !post.is_processing;
});
</script>

<template>
	<div v-if="shouldShowStats">
		<template v-if="post.view_count && post.view_count > 0">
			<AppTranslate
				:style="overlay ? PostOverlayTextStyles : undefined"
				:translate-n="post.view_count || 0"
				:translate-params="{ count: formatNumber(post.view_count || 0) }"
				translate-plural="%{ count } views"
			>
				%{ count } view
			</AppTranslate>
		</template>
		<template v-else>
			<AppTranslate>Views are being collected</AppTranslate>
		</template>
	</div>
</template>
