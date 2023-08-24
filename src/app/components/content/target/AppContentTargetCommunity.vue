<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { CommunityChannelModel } from '../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import AppCommunityVerifiedTick from '../../../../_common/community/verified-tick/verified-tick.vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppContentTarget from './AppContentTarget.vue';

const props = defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
	channel: {
		type: Object as PropType<CommunityChannelModel | null>,
		default: undefined,
	},
	isFeatured: {
		type: Boolean,
	},
	canRemove: {
		type: Boolean,
	},
	hasLinks: {
		type: Boolean,
	},
	noRight: {
		type: Boolean,
	},
});

const { community, channel, canRemove, hasLinks, noRight } = toRefs(props);

const emit = defineEmits({
	remove: (_community: CommunityModel) => true,
});

const leftTo = computed(() => (hasLinks.value ? community.value.routeLocation : undefined));
const rightTo = computed(() =>
	hasLinks.value && channel?.value
		? community.value.channelRouteLocation(channel.value)
		: undefined
);
const to = computed(() =>
	hasLinks.value && !channel?.value ? community.value.routeLocation : undefined
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
