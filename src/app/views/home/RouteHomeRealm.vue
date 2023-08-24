<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import { FiresidePostModel } from '../../../_common/fireside/post/post-model';
import { RealmModel } from '../../../_common/realm/realm-model';
import { $gettextInterpolate } from '../../../_common/translate/translate.service';
import AppActivityFeedPlaceholder from '../../components/activity/feed/AppActivityFeedPlaceholder.vue';
import { ActivityFeedView } from '../../components/activity/feed/view';
import { AppActivityFeedLazy } from '../../components/lazy';
import AppPostAddButton from '../../components/post/add-button/AppPostAddButton.vue';

const props = defineProps({
	realm: {
		type: Object as PropType<RealmModel>,
		default: undefined,
	},
	feed: {
		type: Object as PropType<ActivityFeedView>,
		default: undefined,
	},
});

const { realm, feed } = toRefs(props);

const emit = defineEmits({
	'post-added': (_post: FiresidePostModel) => true,
});

function onPostAdded(post: FiresidePostModel) {
	emit('post-added', post);
}
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
		<AppActivityFeedLazy v-else :feed="feed" show-ads />
	</div>
</template>
