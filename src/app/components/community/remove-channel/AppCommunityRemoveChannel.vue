<script lang="ts" setup>
import { computed, ref, toRef } from 'vue';

import AppButton from '~common/button/AppButton.vue';
import AppCommunityChannelSelect from '~common/community/channel/AppCommunityChannelSelect.vue';
import {
	$removeCommunityChannel,
	CommunityChannelModel,
} from '~common/community/channel/channel.model';
import { CommunityModel } from '~common/community/community.model';
import AppExpand from '~common/expand/AppExpand.vue';
import { showErrorGrowl } from '~common/growls/growls.service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { $gettext } from '~common/translate/translate.service';
import { TranslateDirective as vTranslate } from '~common/translate/translate-directive';

type Props = {
	community: CommunityModel;
	channel: CommunityChannelModel;
};
const { community, channel } = defineProps<Props>();

const emit = defineEmits<{
	removed: [postsMovedTo?: CommunityChannelModel];
}>();

const selectedChannel = ref<CommunityChannelModel>();
const moving = ref(false);

const channels = computed(() => {
	if (!community.channels) {
		return [];
	}

	return community.channels.filter(i => i.id !== channel.id);
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
		await $removeCommunityChannel(channel, moveToChannel);
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
		<span v-else class="-where-to">
			{{ $gettext(`Where to?`) }}
		</span>

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
