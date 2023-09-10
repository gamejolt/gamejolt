<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import { CommunityChannelModel } from '../../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../../_common/community/community.model';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import AppFormsPillSelectorCommunities from '../../../forms/pill-selector/communities/AppFormsPillSelectorCommunities.vue';
import AppContentTarget from '../AppContentTarget.vue';

const props = defineProps({
	communities: {
		type: Array as PropType<CommunityModel[]>,
		required: true,
	},
	initialCommunity: {
		type: Object as PropType<CommunityModel>,
		default: undefined,
	},
	noChannel: {
		type: Boolean,
		default: false,
	},
});

const { communities, initialCommunity, noChannel } = toRefs(props);

const emit = defineEmits({
	selectCommunity: (_community: CommunityModel) => true,
	selectChannel: (_channel: CommunityChannelModel) => true,
	select: (_community: CommunityModel, _channel?: CommunityChannelModel) => true,
	show: () => true,
});

function onSelectCommunity(community: CommunityModel) {
	emit('selectCommunity', community);

	// If channels are disabled, it's enough to select a community, so also emit
	// the 'select' event.
	if (noChannel.value) {
		emit('select', community);
	}
}

// why failing below?
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
