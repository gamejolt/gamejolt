<script lang="ts" setup>
import { CommunityChannelModel } from '../../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../../_common/community/community.model';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import AppFormsPillSelectorCommunities from '../../../forms/pill-selector/communities/AppFormsPillSelectorCommunities.vue';
import AppContentTarget from '../AppContentTarget.vue';

type Props = {
	communities: CommunityModel[];
	initialCommunity?: CommunityModel;
	noChannel?: boolean;
};
const { communities, initialCommunity, noChannel = false } = defineProps<Props>();

const emit = defineEmits<{
	selectCommunity: [community: CommunityModel];
	selectChannel: [channel: CommunityChannelModel];
	select: [community: CommunityModel, channel?: CommunityChannelModel];
	show: [];
}>();

function onSelectCommunity(community: CommunityModel) {
	emit('selectCommunity', community);

	// If channels are disabled, it's enough to select a community, so also emit
	// the 'select' event.
	if (noChannel) {
		emit('select', community);
	}
}

function onSelectChannel(channel: CommunityChannelModel) {
	emit('selectChannel', channel);
}

function onSelect(community: CommunityModel, channel: CommunityChannelModel) {
	emit('select', community, channel);
}
</script>

<template>
	<AppFormsPillSelectorCommunities
		:communities="communities"
		:initial-community="initialCommunity"
		:no-channel="noChannel"
		@select-community="onSelectCommunity"
		@select-channel="onSelectChannel"
		@select="onSelect"
		@show="emit('show')"
	>
		<template #default>
			<AppContentTarget class="-add">
				<template #img>
					<AppJolticon icon="add" />
				</template>

				<AppTranslate>Add community</AppTranslate>
			</AppContentTarget>
		</template>
	</AppFormsPillSelectorCommunities>
</template>
