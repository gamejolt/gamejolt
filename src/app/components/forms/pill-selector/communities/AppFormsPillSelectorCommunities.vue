<script lang="ts" setup>
import { computed, ref } from 'vue';

import { CommunityChannelModel } from '../../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import AppCommunityVerifiedTick from '../../../../../_common/community/verified-tick/AppCommunityVerifiedTick.vue';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import { Popper } from '../../../../../_common/popper/popper.service';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import AppFormsPillSelectorItem from '../_item/AppFormsPillSelectorItem.vue';
import AppFormsPillSelector from '../AppFormsPillSelector.vue';
import AppScrollHelper from '../AppScrollHelper.vue';

type Props = {
	communities: CommunityModel[];
	initialCommunity?: CommunityModel | null;
	noChannel?: boolean;
};
const {
	communities,
	initialCommunity = null,
	noChannel = false,
} = defineProps<Props>();

const emit = defineEmits<{
	selectCommunity: [community: CommunityModel];
	selectChannel: [channel: CommunityChannelModel];
	select: [community: CommunityModel, channel: CommunityChannelModel];
	show: [];
}>();

const selectedCommunity = ref<CommunityModel | null>(null);

const channels = computed(() => selectedCommunity.value?.postableChannels);

const isInitial = computed(() => selectedCommunity.value === initialCommunity);

const shouldShowCommunitySelector = computed(() => !selectedCommunity.value || noChannel);

resetSelections();

function unselectCommunity() {
	if (isInitial.value) {
		return;
	}

	selectedCommunity.value = null;
}

function selectCommunity(community: CommunityModel) {
	selectedCommunity.value = community;
	emit('selectCommunity', community);

	if (noChannel) {
		_closeAndReset();
	}
}

function selectChannel(channel: CommunityChannelModel) {
	emit('selectChannel', channel);
	emit('select', selectedCommunity.value!, channel);
	_closeAndReset();
}

function resetSelections() {
	selectedCommunity.value = initialCommunity;
}

function _closeAndReset() {
	Popper.hideAll();
	selectedCommunity.value = initialCommunity;
}
</script>

<template>
	<AppFormsPillSelector @show="emit('show')">
		<slot />

		<template #header>
			<AppFormsPillSelectorItem
				v-if="selectedCommunity"
				is-header
				:has-header-back="!isInitial"
				@click="unselectCommunity"
			>
				<template #img>
					<AppCommunityThumbnailImg :community="selectedCommunity" />
				</template>

				<template #default>
					{{ selectedCommunity!.name }}
				</template>

				<template #tag>
					<AppCommunityVerifiedTick class="-tick" :community="selectedCommunity" small />
				</template>
			</AppFormsPillSelectorItem>
		</template>

		<template #popover>
			<AppScrollHelper :when="!!selectedCommunity" />
			<div v-if="shouldShowCommunitySelector" class="list-group">
				<AppFormsPillSelectorItem
					v-for="community of communities"
					:key="community.id"
					@click="selectCommunity(community)"
				>
					<template #img>
						<AppCommunityThumbnailImg :community="community" />
					</template>

					<template #default>
						{{ community.name }}
					</template>

					<template #tag>
						<AppCommunityVerifiedTick class="-tick" :community="community" small />
					</template>
				</AppFormsPillSelectorItem>
			</div>
			<div v-else class="-channels list-group">
				<template v-if="channels">
					<AppFormsPillSelectorItem
						v-for="channel of channels"
						:key="channel.id"
						no-img
						@click="selectChannel(channel)"
					>
						<template #default>
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
						</template>
					</AppFormsPillSelectorItem>
				</template>
			</div>
		</template>
	</AppFormsPillSelector>
</template>
