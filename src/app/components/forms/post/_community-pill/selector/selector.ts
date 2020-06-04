import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../../utils/vue';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../../_common/community/thumbnail/img/img.vue';
import AppCommunityVerifiedTick from '../../../../../../_common/community/verified-tick/verified-tick.vue';
import AppJolticon from '../../../../../../_common/jolticon/jolticon.vue';
import { Popper } from '../../../../../../_common/popper/popper.service';
import AppPopper from '../../../../../../_common/popper/popper.vue';

@Component({
	components: {
		AppPopper,
		AppCommunityThumbnailImg,
		AppCommunityVerifiedTick,
		AppJolticon,
	},
})
export default class AppFormPostCommunityPillSelector extends Vue {
	@Prop(propRequired(Array))
	communities!: Community[];

	@Prop(propOptional(Community, null))
	initialCommunity!: Community | null;

	$refs!: {
		header: HTMLElement;
	};

	// State for what page to be on
	selectingChannel = true;
	selectedCommunity: Community | null = null;

	@Emit('select-community') emitSelectCommunity(_community: Community) {}
	@Emit('select-channel') emitSelectChannel(_channel: CommunityChannel) {}
	@Emit('select') emitSelect(_community: Community, _channel: CommunityChannel) {}

	get channels() {
		return this.selectedCommunity?.postableChannels;
	}

	get isInitial() {
		return this.selectedCommunity === this.initialCommunity;
	}

	created() {
		this.resetSelections();
	}

	async scrollToHeader() {
		await this.$nextTick();
		// const parent = findVueParent(this, AppScrollScroller);
		// parent?.$el.scrollTo({
		// 	top: -500,
		// 	behavior: 'smooth',
		// });
		this.$refs.header.scrollIntoView(
			false
			// 	{
			// 	behavior: 'smooth',
			// }
		);
	}

	unselectCommunity() {
		if (this.selectedCommunity === this.initialCommunity) {
			return;
		}

		this.selectingChannel = false;
	}

	selectCommunity(community: Community) {
		this.selectingChannel = true;
		this.selectedCommunity = community;
		this.emitSelectCommunity(community);
		this.scrollToHeader();
	}

	selectChannel(channel: CommunityChannel) {
		this.emitSelectChannel(channel);
		this.emitSelect(this.selectedCommunity!, channel);
		Popper.hideAll();
	}

	resetSelections() {
		this.selectedCommunity = this.initialCommunity;
	}
}
