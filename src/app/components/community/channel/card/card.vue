<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import {
	Community,
	CommunityPresetChannelType,
} from '../../../../../_common/community/community.model';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import { MediaItem } from '../../../../../_common/media-item/media-item-model';
import { vAppObserveDimensions } from '../../../../../_common/observe-dimensions/observe-dimensions.directive';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

// Sync up with the './variables' file.
const CARD_WIDTH = 270;
const CARD_HEIGHT = 70;

@Options({
	components: {
		AppMediaItemBackdrop,
	},
	directives: {
		AppTooltip: vAppTooltip,
		AppObserveDimensions: vAppObserveDimensions,
	},
})
export default class AppCommunityChannelCard extends Vue {
	@Prop({ type: Object, required: true }) community!: Community;
	@Prop({ type: String, required: true }) path!: string;
	@Prop({ type: String, required: true }) label!: string;
	@Prop(Object) backgroundItem?: MediaItem;
	@Prop({ type: Boolean, default: false }) isActive!: boolean;
	@Prop({ type: Boolean, default: false }) isUnread!: boolean;
	@Prop({ type: String, default: undefined }) sort?: string;
	@Prop({ type: Boolean, default: false }) isLocked!: boolean;
	@Prop({ type: Boolean, default: false }) isUnpublished!: boolean;
	@Prop({ type: Boolean, default: false }) isArchived!: boolean;
	@Prop(String) channelType?: string;

	cardHeight = CARD_HEIGHT;

	declare $el: HTMLElement;

	mounted() {
		// Initialize cardHeight to be based off the card width, maintaining aspect ratio.
		this.updateCardHeight();
	}

	get height() {
		return this.cardHeight + 'px';
	}

	get linkTo() {
		if (this.path === CommunityPresetChannelType.FEATURED) {
			return {
				name: 'communities.view.overview',
				params: { path: this.community.path },
			};
		}

		const link = {
			name: 'communities.view.channel',
			params: { path: this.community.path, channel: this.path },
		} as any;

		if (this.sort) {
			link.query = { sort: this.sort };
		}

		return link;
	}

	updateCardHeight() {
		// This gets triggered when the card resizes, setting the new card height appropriately.
		this.cardHeight = (this.$el.offsetWidth / CARD_WIDTH) * CARD_HEIGHT;
	}
}
</script>

<template>
	<div class="community-channel-card-container">
		<router-link
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
		</router-link>
	</div>
</template>

<style lang="stylus" src="./card.styl" scoped></style>
