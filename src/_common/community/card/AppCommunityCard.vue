<script lang="ts" setup>
import { RouterLink } from 'vue-router';

import { trackGotoCommunity } from '../../analytics/analytics.service';
import AppCommunityCardBase from '../card-base/AppCommunityCardBase.vue';
import { CommunityModel } from '../community.model';
import AppCommunityThumbnailImg from '../thumbnail/AppCommunityThumbnailImg.vue';

type Props = {
	community: CommunityModel;
	elevate?: boolean;
	allowEdit?: boolean;
	trackGoto?: boolean;
};
const { community, elevate, allowEdit = true, trackGoto } = defineProps<Props>();

function doTrackGotoCommunity() {
	if (trackGoto) {
		trackGotoCommunity({
			source: 'card',
			id: community.id,
			path: community.path,
		});
	}
}
</script>

<template>
	<AppCommunityCardBase
		:community="community"
		:elevate="elevate"
		:allow-edit="allowEdit"
		:track-goto="trackGoto"
	>
		<template #thumbnail>
			<RouterLink :to="community.routeLocation" @click="doTrackGotoCommunity()">
				<AppCommunityThumbnailImg :community="community" />
			</RouterLink>
		</template>
	</AppCommunityCardBase>
</template>
