<script lang="ts">
import { PropType, computed, onMounted, ref, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import {
	CommunityModel,
	CommunityPresetChannelType,
} from '../../../../../_common/community/community.model';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import { MediaItemModel } from '../../../../../_common/media-item/media-item-model';
import { vAppObserveDimensions } from '../../../../../_common/observe-dimensions/observe-dimensions.directive';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

export const CommunityChannelCardWidth = 270;
export const CommunityChannelCardHeight = 70;
</script>

<script lang="ts" setup>
const props = defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
	path: {
		type: String,
		required: true,
	},
	label: {
		type: String,
		required: true,
	},
	backgroundItem: {
		type: Object as PropType<MediaItemModel>,
		default: undefined,
	},
	isActive: {
		type: Boolean,
	},
	isUnread: {
		type: Boolean,
	},
	sort: {
		type: String,
		default: undefined,
	},
	isLocked: {
		type: Boolean,
	},
	isUnpublished: {
		type: Boolean,
	},
	isArchived: {
		type: Boolean,
	},
	channelType: {
		type: String,
		default: undefined,
	},
});

const {
	community,
	path,
	label,
	backgroundItem,
	isActive,
	isUnread,
	sort,
	isLocked,
	isUnpublished,
	isArchived,
	channelType,
} = toRefs(props);

const rootElem = ref<HTMLDivElement>();
const cardHeight = ref<number>(CommunityChannelCardHeight);

const linkTo = computed(() => {
	if (path.value === CommunityPresetChannelType.FEATURED) {
		return {
			name: 'communities.view.overview',
			params: { path: community.value.path },
		};
	}

	const link = {
		name: 'communities.view.channel',
		params: { path: community.value.path, channel: path.value },
	} as any;

	if (sort?.value) {
		link.query = { sort: sort.value };
	}

	return link;
});

onMounted(() => {
	// Initialize cardHeight to be based off the card width, maintaining aspect ratio.
	updateCardHeight();
});

function updateCardHeight() {
	// This gets triggered when the card resizes, setting the new card height appropriately.
	if (!rootElem.value) {
		return;
	}

	cardHeight.value =
		(rootElem.value.offsetWidth / CommunityChannelCardWidth) * CommunityChannelCardHeight;
}
</script>

<template>
	<div
		ref="rootElem"
		:style="{
			maxWidth: `${CommunityChannelCardWidth}px`,
		}"
	>
		<RouterLink
			v-app-observe-dimensions="updateCardHeight"
			class="community-channel-card sheet sheet-no-full-bleed sheet-full"
			:class="{ '-active': isActive, 'theme-dark': backgroundItem }"
			:style="{
				maxHeight: `${CommunityChannelCardHeight}px`,
				height: `${cardHeight}px`,
			}"
			:to="linkTo"
		>
			<div v-if="backgroundItem" class="-card-bg">
				<AppMediaItemBackdrop :media-item="backgroundItem" radius="lg">
					<div
						class="-card-bg-img"
						:style="{
							backgroundImage: `url('${backgroundItem.mediaserver_url}')`,
						}"
					/>
					<div class="-overlay" />
				</AppMediaItemBackdrop>
			</div>

			<div class="-card-content">
				<div class="-card-content-title">
					<AppJolticon
						v-if="isArchived"
						v-app-tooltip.top="$gettext(`Archived Channel`)"
						icon="lock"
					/>
					<AppJolticon
						v-else-if="isLocked"
						v-app-tooltip.top="
							$gettext(`You do not have permissions to post to this channel`)
						"
						icon="lock"
					/>
					<AppJolticon
						v-if="isUnpublished"
						v-app-tooltip.top="$gettext(`Channel is not publicly visible`)"
						icon="subscribed"
					/>
					<AppJolticon
						v-if="channelType === 'competition'"
						v-app-tooltip.top="$gettext(`Jam`)"
						icon="jams"
					/>
					<span :title="label">{{ label }}</span>
				</div>

				<div
					v-if="isUnread"
					v-app-tooltip="
						$gettext(`There are new posts since you last viewed this channel`)
					"
					class="-card-content-unread"
				/>
			</div>

			<div v-if="isUnpublished || isArchived" class="-card-unpublished" />
		</RouterLink>
	</div>
</template>

<style lang="stylus" scoped>
.community-channel-card
	elevate-hover-1()
	position: relative
	display: block
	flex-shrink: 0
	overflow: hidden
	cursor: pointer
	outline: none
	transition: border 200ms
	// Overwrite sheet styling
	margin-bottom: ($line-height-computed / 2)

	&:hover
		theme-prop('border-color', 'link')

		.-card-bg-img
		.-card-unpublished
			filter: grayscale(0.6)

		.-overlay
			opacity: 0

	&.-active
		elevate-2()
		border-color: var(--theme-link)

		.-card-bg-img
			filter: none !important
			transform: scale(1.1)

		.-card-unpublished
			transform: scale(1.1)

		.-overlay
			opacity: 0

		.-card-content-title
			background-color: var(--theme-bi-bg)
			color: var(--theme-bi-fg)

.-overlay
	change-bg('bg-offset')
	position: absolute
	opacity: 0.2
	width: 100%
	height: 100%
	transition: opacity 200ms

.-card
	&-bg
		position: absolute
		top: 0
		left: 0
		width: 100%
		height: 100%
		z-index: 1

		&-img
			position: absolute
			top: 0
			left: 0
			width: 100%
			height: 100%
			background-size: cover
			background-position: center center
			background-repeat: no-repeat
			filter: grayscale(0.9)
			transition: transform 200ms, filter 200ms

	&-content
		position: relative
		z-index: 3
		margin: 8px
		display: flex
		justify-content: space-between

		&-title
			rounded-corners()
			text-overflow()
			font-weight: 600
			padding: 2px 6px
			background-color: var(--theme-darkest)
			color: var(--dark-theme-fg)

			& > *
				vertical-align: middle

		&-unread
			margin-top: 4px
			width: 12px
			height: 12px
			background-color: var(--theme-notice)
			flex-shrink: 0
			border: 2px solid var(--theme-bg-offset)
			border-radius: 50%
			filter: drop-shadow(0 0 7px var(--theme-notice))

	&-unpublished
		position: absolute
		z-index: 2
		top: 0
		left: 0
		width: 100%
		height: 100%
		background: repeating-linear-gradient(
			45deg,
			var(--theme-bi-bg),
			var(--theme-bi-bg) 8px,
			transparent 8px,
			transparent 16px
		)
		filter: grayscale(0.6)
		opacity: 0.15
		transition: transform 200ms, filter 200ms
</style>
