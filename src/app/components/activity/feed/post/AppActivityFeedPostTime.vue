<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { FiresidePostModel } from '../../../../../_common/fireside/post/post-model';
import AppTimeAgo from '../../../../../_common/time/AppTimeAgo.vue';

const props = defineProps({
	post: {
		type: Object as PropType<FiresidePostModel>,
		required: true,
	},
	link: {
		type: String,
		required: true,
	},
});

const { post, link } = toRefs(props);

const date = computed(() => (post.value.isActive ? post.value.published_on : post.value.added_on));
</script>

<template>
	<router-link :to="link" class="link-unstyled">
		<template v-if="post.isScheduled">
			<span class="tag" style="vertical-align: middle">
				<AppJolticon icon="calendar-grid" />
				{{ ' ' }}
				<AppTranslate>Scheduled</AppTranslate>
			</span>
			{{ ' ' }}
			<AppTimeAgo :date="post.scheduled_for!" strict without-suffix />
		</template>
		<template v-else>
			<AppTimeAgo :date="date" strict without-suffix />
		</template>
	</router-link>
</template>
