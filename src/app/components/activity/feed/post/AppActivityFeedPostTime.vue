<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import { FiresidePostModel } from '../../../../../_common/fireside/post/post-model';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppTimeAgo from '../../../../../_common/time/AppTimeAgo.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';

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
	<RouterLink :to="link" class="link-unstyled">
		<template v-if="post.isScheduled">
			<span class="tag" :style="{ verticalAlign: `middle` }">
				<AppJolticon icon="calendar-grid" />
				{{ ' ' }}
				{{ $gettext(`Scheduled`) }}
			</span>
			{{ ' ' }}
			<AppTimeAgo :date="post.scheduled_for!" strict without-suffix />
		</template>
		<template v-else>
			<AppTimeAgo :date="date" strict without-suffix />
		</template>
	</RouterLink>
</template>
