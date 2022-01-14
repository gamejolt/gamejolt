<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import AppCommunityChannelSelect from '../../../../_common/community/channel/select/select.vue';
import { Community } from '../../../../_common/community/community.model';
import AppExpand from '../../../../_common/expand/expand.vue';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppPill from '../../../../_common/pill/pill.vue';

@Options({
	components: {
		AppCommunityChannelSelect,
		AppPill,
		AppExpand,
	},
})
export default class AppCommunityRemoveChannel extends Vue {
	@Prop(Object)
	community!: Community;

	@Prop(Object)
	channel!: CommunityChannel;

	selectedChannel: CommunityChannel | null = null;
	moving = false;

	@Emit('removed')
	emitRemoved(_postsMovedTo?: CommunityChannel) {}

	get channels() {
		if (!this.community.channels) {
			return [];
		}

		return this.community.channels.filter(i => i.id !== this.channel.id);
	}

	get hasSelectedChannel() {
		return this.selectedChannel instanceof CommunityChannel;
	}

	onMove() {
		if (!this.selectedChannel) {
			return;
		}

		return this.removeChannel(this.selectedChannel);
	}

	onEject() {
		return this.removeChannel();
	}

	private async removeChannel(moveToChannel?: CommunityChannel) {
		let success = false;
		try {
			await this.channel.$remove(moveToChannel);
			success = true;
		} catch (e) {
			showErrorGrowl(
				this.$gettext('Could not remove channel for some reason. Try again later!')
			);
		}

		if (success) {
			this.emitRemoved(moveToChannel);
		}
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
			<app-button primary icon="arrow-forward" @click="moving = true">
				<translate>Move</translate>
			</app-button>

			<app-button primary icon="remove" @click="onEject">
				<translate>Eject</translate>
			</app-button>
		</template>
		<span v-else class="-where-to">Where to?</span>

		<app-expand :when="moving">
			<app-community-channel-select
				v-model="selectedChannel"
				class="-channel-select"
				:channels="channels"
			/>

			<div class="-move-controls">
				<app-button
					primary
					:disabled="!hasSelectedChannel"
					icon="arrow-forward"
					@click="onMove"
				>
					<translate>Move</translate>
				</app-button>
				<a @click="moving = false">
					<app-jolticon icon="remove" />
				</a>
			</div>
		</app-expand>

		<p class="help-block">
			<translate>
				Removing a channel is irreversible. Once it's gone, it's gone for good.
			</translate>
			<template v-if="moving">
				<br />
				<translate>
					It might take a few moments for the posts to show in the new channel.
				</translate>
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
