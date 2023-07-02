<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import { Realm } from '../../../_common/realm/realm-model';
import { SettingTwitterMoad } from '../../../_common/settings/settings.service';
import { $gettextInterpolate } from '../../../_common/translate/translate.service';
import AppActivityFeedPlaceholder from '../../components/activity/feed/AppActivityFeedPlaceholder.vue';
import { ActivityFeedView } from '../../components/activity/feed/view';
import { AppActivityFeedLazy } from '../../components/lazy';
import AppPostAddButton from '../../components/post/add-button/AppPostAddButton.vue';
import AppTwitterMoad from '../../components/twitter-moad/AppTwitterMoad.vue';

const props = defineProps({
	realm: {
		type: Object as PropType<Realm>,
		default: undefined,
	},
	feed: {
		type: Object as PropType<ActivityFeedView>,
		default: undefined,
	},
});

const { realm, feed } = toRefs(props);

const emit = defineEmits({
	'post-added': (_post: FiresidePost) => true,
});

function onPostAdded(post: FiresidePost) {
	emit('post-added', post);
}

const twitterMoad = computed(() => SettingTwitterMoad.get());
</script>

<template>
	<!-- RouteHomeRealm -->
	<div>
		<AppPostAddButton
			v-if="realm && feed"
			:realm="realm"
			:placeholder="
				$gettextInterpolate(`Post about %{ realm }!`, {
					realm: realm.name,
				})
			"
			@add="onPostAdded"
		/>

		<AppActivityFeedPlaceholder v-if="!feed || !feed.isBootstrapped" />
		<AppTwitterMoad v-else-if="twitterMoad" />
		<AppActivityFeedLazy v-else :feed="feed" show-ads />
	</div>
</template>
