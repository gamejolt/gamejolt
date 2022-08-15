<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import AppCommunityVerifiedTick from '../../../../../../_common/community/verified-tick/verified-tick.vue';
import AppPopper from '../../../../../../_common/popper/AppPopper.vue';
import { Popper } from '../../../../../../_common/popper/popper.service';
import { vAppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { AppScrollHelper } from './scroll-helper/scroll-helper';

@Options({
	components: {
		AppPopper,
		AppCommunityThumbnailImg,
		AppCommunityVerifiedTick,
		AppScrollHelper,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppFormsCommunityPillSelector extends Vue {
	@Prop({ type: Array, required: true })
	communities!: Community[];

	@Prop({ type: Object, default: null })
	initialCommunity!: Community | null;

	@Prop({ type: Boolean, default: true })
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
</script>

<template>
	<AppPopper
		popover-class="fill-bg"
		max-height="45vh"
		hide-on-state-change
		@hide="resetSelections"
	>
		<slot />

		<template v-if="selectedCommunity && withChannel" #header>
			<a
				class="-community-item -selected list-group-item"
				:class="{ '-initial': isInitial }"
				@click="unselectCommunity"
			>
				<div class="-community-img">
					<AppCommunityThumbnailImg :community="selectedCommunity" />
				</div>
				<AppJolticon v-if="!isInitial" class="-back" icon="arrow-left" />
				<span class="-text">
					{{ selectedCommunity.name }}
				</span>
				<AppCommunityVerifiedTick class="-tick" :community="selectedCommunity" small />
			</a>
		</template>

		<template #popover>
			<div class="-container">
				<AppScrollHelper :when="!!selectedCommunity" />
				<div v-if="shouldShowCommunitySelector" class="-communities list-group">
					<a
						v-for="community of communities"
						:key="community.id"
						class="-community-item list-group-item"
						@click="selectCommunity(community)"
					>
						<div class="-community-img">
							<AppCommunityThumbnailImg :community="community" />
						</div>

						<span class="-text">
							{{ community.name }}
						</span>
						<AppCommunityVerifiedTick class="-tick" :community="community" small />
					</a>
				</div>

				<div v-else class="-channels list-group">
					<template v-if="channels">
						<a
							v-for="channel of channels"
							:key="channel.id"
							class="-channel-item list-group-item"
							@click="selectChannel(channel)"
						>
							<span class="-text">
								<AppJolticon
									v-if="channel.type === 'competition'"
									v-app-tooltip="$gettext(`Game Jam`)"
									icon="jams"
								/>
								<AppJolticon
									v-if="channel.isUnpublished"
									v-app-tooltip="$gettext(`Channel is not publicly visible`)"
									icon="subscribed"
								/>

								{{ channel.displayTitle }}
							</span>
						</a>
					</template>
				</div>
			</div>
		</template>
	</AppPopper>
</template>

<style lang="stylus" src="./selector.styl" scoped></style>
