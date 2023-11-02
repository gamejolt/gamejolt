<script lang="ts" setup>
import { PropType, computed, onMounted, ref, toRef, toRefs } from 'vue';
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

// Sync up with the './variables' file.
// TODO(component-setup-refactor): sync up manually?
const CardWidth = 270;
const CardHeight = 70;

// TODO(component-setup-refactor): changing the required of backgroundItem to true
// as it's being provided in the parent component.
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
		required: true,
	},
	isActive: {
		type: Boolean,
	},
	isUnread: {
		type: Boolean,
	},
	sort: {
		type: String,
		required: false,
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
		required: false,
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
const cardHeight = ref<number>(CardHeight);

const height = toRef(() => cardHeight.value + 'px');

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

	cardHeight.value = (rootElem.value.offsetWidth / CardWidth) * CardHeight;
}
</script>

<template>
	<div ref="rootElem" class="community-channel-card-container">
		<RouterLink
			v-app-observe-dimensions="updateCardHeight"
			class="community-channel-card sheet sheet-no-full-bleed sheet-full"
			:class="{ '-active': isActive, 'theme-dark': backgroundItem }"
			:to="linkTo"
			:style="{ height }"
		>
			<div v-if="backgroundItem" class="-card-bg">
				<AppMediaItemBackdrop :media-item="backgroundItem" radius="lg">
					<div
						class="-card-bg-img"
						:style="{
							'background-image': `url('${backgroundItem.mediaserver_url}')`,
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

<style lang="stylus" src="./card.styl" scoped></style>
