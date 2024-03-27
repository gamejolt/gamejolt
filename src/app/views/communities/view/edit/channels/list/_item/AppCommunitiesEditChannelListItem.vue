<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import AppButton from '../../../../../../../../_common/button/AppButton.vue';
import AppCardListItem from '../../../../../../../../_common/card/list/AppCardListItem.vue';
import { CommunityChannelModel } from '../../../../../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../../../../../_common/community/community.model';
import AppJolticon from '../../../../../../../../_common/jolticon/AppJolticon.vue';
import { vAppTooltip } from '../../../../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../../../../_common/translate/translate.service';
import { showCommunityRemoveChannelModal } from '../../../../../../../components/community/remove-channel/modal/modal.service';

const props = defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
	channel: {
		type: Object as PropType<CommunityChannelModel>,
		required: true,
	},
	archivedChannels: {
		type: Array as PropType<Array<CommunityChannelModel>>,
		required: true,
	},
});

const { community, channel, archivedChannels } = toRefs(props);

const canRemoveChannel = computed(() => {
	// Cannot remove when no channel perms
	if (!community.value.hasPerms('community-channels')) {
		return false;
	}

	// Draft channels can always be removed because they don't count towards the active channels.
	if (channel.value.visibility === 'draft') {
		return true;
	}

	// Same as Draft channels, archived channels don't count towards active channels.
	if (channel.value.is_archived) {
		return true;
	}

	return community.value.canRemoveChannel;
});

const canEditChannel = computed(() => {
	// When it's a competition channel, mods with competition perms can edit.
	if (
		channel.value.type === 'competition' &&
		community.value.hasPerms('community-competitions')
	) {
		return true;
	}

	return community.value.hasPerms('community-channels');
});

async function onClickRemoveChannel(channelToRemove: CommunityChannelModel) {
	await showCommunityRemoveChannelModal(community.value, channelToRemove);

	if (channelToRemove._removed) {
		if (channelToRemove.is_archived) {
			archivedChannels.value = archivedChannels.value.filter(
				i => i.id !== channelToRemove.id
			);
		} else {
			if (community.value.channels) {
				community.value.channels = community.value.channels!.filter(
					i => i.id !== channelToRemove.id
				);
			}
		}
	}
}
</script>

<template>
	<AppCardListItem :item="channel" force-expandable-padding>
		<a
			v-if="canRemoveChannel"
			v-app-tooltip="$gettext(`Remove Channel`)"
			class="card-remove"
			@click.stop="onClickRemoveChannel(channel)"
		>
			<AppJolticon icon="remove" />
		</a>

		<div class="card-title">
			<div>
				<span v-if="channel.type === 'competition'" class="tag">
					<AppJolticon icon="jams" />
					{{ $gettext(`Game Jam`) }}
				</span>
				<span v-if="channel.visibility === 'draft'" class="tag">
					{{ $gettext(`Draft`) }}
				</span>
			</div>
			<div>
				<template v-if="channel.hasDisplayTitle">
					<b class="-title">{{ channel.displayTitle }}</b>
					<span class="hidden-xs">&nbsp;</span>
					<br class="visible-xs" />
					<span class="-path text-muted">{{ channel.title }}</span>
				</template>
				<template v-else>
					<b>{{ channel.title }}</b>
				</template>
			</div>
		</div>

		<div v-if="canEditChannel" class="-controls">
			<AppButton
				primary
				:to="{
					name: 'communities.view.edit.channels.overview',
					params: { channel: channel.title },
				}"
			>
				{{ $gettext(`Edit Channel`) }}
			</AppButton>
		</div>
	</AppCardListItem>
</template>

<style lang="stylus" scoped>
.-title
.-path
	text-overflow()
	display: inline-block
	max-width: 100%
</style>
