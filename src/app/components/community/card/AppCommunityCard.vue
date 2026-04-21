<script lang="ts" setup>
import { RouterLink } from 'vue-router';

import AppCommunityCardBase from '~app/components/community/card/AppCommunityCardBase.vue';
import { trackGotoCommunity } from '~common/analytics/analytics.service';
import { CommunityModel } from '~common/community/community.model';
import AppCommunityThumbnailImg from '~common/community/thumbnail/AppCommunityThumbnailImg.vue';

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
