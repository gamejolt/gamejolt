<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import AppFormsPillSelectorCommunities from '../../../forms/pill-selector/communities/AppFormsPillSelectorCommunities.vue';
import AppContentTarget from '../AppContentTarget.vue';

const props = defineProps({
	communities: {
		type: Array as PropType<Community[]>,
		required: true,
	},
	initialCommunity: {
		type: Object as PropType<Community>,
		default: undefined,
	},
	noChannel: {
		type: Boolean,
		default: false,
	},
});

const { communities, initialCommunity, noChannel } = toRefs(props);

const emit = defineEmits({
	selectCommunity: (_community: Community) => true,
	selectChannel: (_channel: CommunityChannel) => true,
	select: (_community: Community, _channel?: CommunityChannel) => true,
	show: () => true,
});

function onSelectCommunity(community: Community) {
	emit('selectCommunity', community);

	// If channels are disabled, it's enough to select a community, so also emit
	// the 'select' event.
	if (noChannel.value) {
		emit('select', community);
	}
}

function onSelectChannel(channel: CommunityChannel) {
	emit('selectChannel', channel);
}

function onSelect(community: Community, channel: CommunityChannel) {
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
