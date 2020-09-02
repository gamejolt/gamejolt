import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import {
	Community,
	CommunityPresetChannelType,
} from '../../../../../_common/community/community.model';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/backdrop.vue';
import { MediaItem } from '../../../../../_common/media-item/media-item-model';
import { AppObserveDimensions } from '../../../../../_common/observe-dimensions/observe-dimensions.directive';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

// Sync up with the './variables' file.
const CARD_WIDTH = 270;
const CARD_HEIGHT = 70;

@Component({
	components: {
		AppMediaItemBackdrop,
	},
	directives: {
		AppTooltip,
		AppObserveDimensions,
	},
})
export default class AppCommunityChannelCard extends Vue {
	@Prop(propRequired(Community)) community!: Community;
	@Prop(propRequired(String)) path!: string;
	@Prop(propRequired(String)) label!: string;
	@Prop(propOptional(MediaItem)) backgroundItem?: MediaItem;
	@Prop(propOptional(Boolean, false)) isActive!: boolean;
	@Prop(propOptional(Boolean, false)) isUnread!: boolean;
	@Prop(propOptional(String)) sort!: string;
	@Prop(propOptional(Boolean, false)) isLocked!: boolean;

	cardHeight = CARD_HEIGHT;

	$el!: HTMLElement;

	mounted() {
		// Initialize cardHeight to be based off the card width, maintaining aspect ratio.
		this.updateCardHeight();
	}

	get height() {
		return this.cardHeight + 'px';
	}

	get linkTo() {
		if (this.path === CommunityPresetChannelType.FEATURED) {
			return { name: 'communities.view.overview' };
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
