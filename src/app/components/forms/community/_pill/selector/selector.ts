import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../../utils/vue';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../../_common/community/thumbnail/img/img.vue';
import AppCommunityVerifiedTick from '../../../../../../_common/community/verified-tick/verified-tick.vue';
import AppJolticon from '../../../../../../_common/jolticon/jolticon.vue';
import { Popper } from '../../../../../../_common/popper/popper.service';
import AppPopper from '../../../../../../_common/popper/popper.vue';
import { AppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { AppScrollHelper } from './scroll-helper/scroll-helper';

@Options({
	components: {
		AppPopper,
		AppCommunityThumbnailImg,
		AppCommunityVerifiedTick,
		AppJolticon,
		AppScrollHelper,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFormsCommunityPillSelector extends Vue {
	@Prop(propRequired(Array))
	communities!: Community[];

	@Prop(propOptional(Community, null))
	initialCommunity!: Community | null;

	@Prop(propOptional(Boolean, true))
	withChannel!: boolean;

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

	get shouldShowCommunitySelector() {
		return !this.selectedCommunity || !this.withChannel;
	}

	created() {
		this.resetSelections();
	}

	unselectCommunity() {
		if (this.isInitial) {
			return;
		}

		this.selectedCommunity = null;
	}

	selectCommunity(community: Community) {
		this.selectedCommunity = community;
		this.emitSelectCommunity(community);

		if (!this.withChannel) {
			Popper.hideAll();
		}
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
