<script lang="ts" setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import { FiresidePostModel } from '~common/fireside/post/post-model';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppTimeAgo from '~common/time/AppTimeAgo.vue';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	post: FiresidePostModel;
	link: string;
};
const { post, link } = defineProps<Props>();

const date = computed(() => (post.isActive ? post.published_on : post.added_on));
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
