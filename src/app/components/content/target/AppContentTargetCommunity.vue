<script lang="ts" setup>
import { computed } from 'vue';

import { CommunityChannelModel } from '../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import AppCommunityVerifiedTick from '../../../../_common/community/verified-tick/AppCommunityVerifiedTick.vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppContentTarget from './AppContentTarget.vue';

type Props = {
	community: CommunityModel;
	channel?: CommunityChannelModel | null;
	isFeatured?: boolean;
	canRemove?: boolean;
	hasLinks?: boolean;
	noRight?: boolean;
};
const { community, channel, isFeatured, canRemove, hasLinks, noRight } = defineProps<Props>();

const emit = defineEmits<{
	remove: [community: CommunityModel];
}>();

const leftTo = computed(() => (hasLinks ? community.routeLocation : undefined));
const rightTo = computed(() =>
	hasLinks && channel
		? community.channelRouteLocation(channel)
		: undefined
);
const to = computed(() =>
	hasLinks && !channel ? community.routeLocation : undefined
);
</script>

<template>
	<AppContentTarget
		:has-remove="canRemove"
		:left-to="leftTo"
		:right-to="rightTo"
		:to="to"
		:has-right="!noRight"
		:no-hover="!hasLinks"
		@remove="emit('remove', community)"
	>
		<template #img>
			<AppCommunityThumbnailImg :community="community" />
		</template>

		<template #default>
			{{ community.name }}

			<AppCommunityVerifiedTick
				v-if="community.is_verified"
				class="-tick"
				:community="community"
				small
			/>
		</template>

		<template #right>
			<slot>
				{{ channel?.displayTitle }}

				<AppJolticon v-if="isFeatured" class="-featured" icon="star" />
			</slot>
		</template>
	</AppContentTarget>
</template>

<style lang="stylus" scoped>
.-featured
	margin: 0 2px
	font-size: $jolticon-size * 0.85
</style>
