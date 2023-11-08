<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import { trackGotoCommunity } from '../../analytics/analytics.service';
import AppCommunityCardBase from '../card-base/AppCommunityCardBase.vue';
import { CommunityModel } from '../community.model';
import AppCommunityThumbnailImg from '../thumbnail/AppCommunityThumbnailImg.vue';

const props = defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
	elevate: {
		type: Boolean,
	},
	allowEdit: {
		type: Boolean,
		default: true,
	},
	trackGoto: {
		type: Boolean,
	},
});

const { community, trackGoto } = toRefs(props);

function doTrackGotoCommunity() {
	if (trackGoto.value) {
		trackGotoCommunity({
			source: 'card',
			id: community.value.id,
			path: community.value.path,
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
