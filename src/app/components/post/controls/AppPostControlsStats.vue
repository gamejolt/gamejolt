<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { formatNumber } from '../../../../_common/filters/number';
import { FiresidePostModel } from '../../../../_common/fireside/post/post-model';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';

const props = defineProps({
	post: {
		type: Object as PropType<FiresidePostModel>,
		required: true,
	},
	overlay: {
		type: Boolean,
	},
});

const { post, overlay } = toRefs(props);
const { user } = useCommonStore();

const hasPerms = computed(() => {
	if (!user.value) {
		return false;
	}
	return post.value.isEditableByUser(user.value);
});

const shouldShowStats = computed(() => {
	return hasPerms.value && post.value.isActive && !post.value.is_processing;
});
</script>

<template>
	<div v-if="shouldShowStats">
		<template v-if="post.view_count && post.view_count > 0">
			<AppTranslate
				:class="{ '-overlay-text': overlay }"
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

<style lang="stylus" scoped>
.-overlay-text
	color: white
	text-shadow: black 1px 1px 4px
</style>
