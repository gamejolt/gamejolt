<script lang="ts" setup>
import { PropType, computed, ref, toRef, toRefs } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppCommunityChannelSelect from '../../../../_common/community/channel/AppCommunityChannelSelect.vue';
import {
	$removeCommunityChannel,
	CommunityChannelModel,
} from '../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../_common/community/community.model';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { $gettext } from '../../../../_common/translate/translate.service';

const props = defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
	channel: {
		type: Object as PropType<CommunityChannelModel>,
		required: true,
	},
});

const emit = defineEmits({
	removed: (_postsMovedTo?: CommunityChannelModel) => true,
});

const { community, channel } = toRefs(props);

const selectedChannel = ref<CommunityChannelModel | undefined>(undefined);
const moving = ref(false);

const channels = computed(() => {
	if (!community.value.channels) {
		return [];
	}

	return community.value.channels.filter(i => i.id !== channel.value.id);
});

const hasSelectedChannel = toRef(() => selectedChannel.value instanceof CommunityChannelModel);

function onMove() {
	if (!selectedChannel.value) {
		return;
	}

	return removeChannel(selectedChannel.value);
}

function onEject() {
	return removeChannel();
}

async function removeChannel(moveToChannel?: CommunityChannelModel) {
	let success = false;
	try {
		await $removeCommunityChannel(channel.value, moveToChannel);
		success = true;
	} catch (e) {
		showErrorGrowl($gettext('Could not remove channel for some reason. Try again later!'));
	}

	if (success) {
		emit('removed', moveToChannel);
	}
}
</script>

<template>
	<div>
		<p v-translate>
			All posts in this channel will be
			<b>ejected</b>
			from the community,
			<br />
			unless you choose to
			<b>move</b>
			them to a different channel instead.
		</p>

		<template v-if="!moving">
			<AppButton primary icon="arrow-forward" @click="moving = true">
				{{ $gettext(`Move`) }}
			</AppButton>

			<AppButton primary icon="remove" @click="onEject">
				{{ $gettext(`Eject`) }}
			</AppButton>
		</template>
		<span v-else class="-where-to">Where to?</span>

		<AppExpand :when="moving">
			<AppCommunityChannelSelect
				v-model="selectedChannel"
				class="-channel-select"
				:channels="channels"
			/>

			<div class="-move-controls">
				<AppButton
					primary
					:disabled="!hasSelectedChannel"
					icon="arrow-forward"
					@click="onMove"
				>
					{{ $gettext(`Move`) }}
				</AppButton>
				<a @click="moving = false">
					<AppJolticon icon="remove" />
				</a>
			</div>
		</AppExpand>

		<p class="help-block">
			{{
				$gettext(`Removing a channel is irreversible. Once it's gone, it's gone for good.`)
			}}
			<template v-if="moving">
				<br />
				{{
					$gettext(
						`It might take a few moments for the posts to show in the new channel.`
					)
				}}
			</template>
		</p>
	</div>
</template>

<style lang="stylus" scoped>
.-where-to
	display: inline-block
	line-height: $button-md-line-height
	font-weight: bold

.-channel-select
	margin: $line-height-computed 0

.-move-controls
	display: flex
	align-items: center

	button
		margin-right: 10px

	a
		color: var(--theme-fg)
</style>
