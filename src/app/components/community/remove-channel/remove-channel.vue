<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppCommunityChannelSelect from '../../../../_common/community/channel/AppCommunityChannelSelect.vue';
import { CommunityChannelModel } from '../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../_common/community/community.model';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppPill from '../../../../_common/pill/AppPill.vue';

@Options({
	components: {
		AppCommunityChannelSelect,
		AppPill,
		AppExpand,
	},
})
export default class AppCommunityRemoveChannel extends Vue {
	@Prop(Object)
	community!: CommunityModel;

	@Prop(Object)
	channel!: CommunityChannelModel;

	selectedChannel: CommunityChannelModel | null = null;
	moving = false;

	@Emit('removed')
	emitRemoved(_postsMovedTo?: CommunityChannelModel) {}

	get channels() {
		if (!this.community.channels) {
			return [];
		}

		return this.community.channels.filter(i => i.id !== this.channel.id);
	}

	get hasSelectedChannel() {
		return this.selectedChannel instanceof CommunityChannelModel;
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

	private async removeChannel(moveToChannel?: CommunityChannelModel) {
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
			<AppButton primary icon="arrow-forward" @click="moving = true">
				<AppTranslate>Move</AppTranslate>
			</AppButton>

			<AppButton primary icon="remove" @click="onEject">
				<AppTranslate>Eject</AppTranslate>
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
					<AppTranslate>Move</AppTranslate>
				</AppButton>
				<a @click="moving = false">
					<AppJolticon icon="remove" />
				</a>
			</div>
		</AppExpand>

		<p class="help-block">
			<AppTranslate>
				Removing a channel is irreversible. Once it's gone, it's gone for good.
			</AppTranslate>
			<template v-if="moving">
				<br />
				<AppTranslate>
					It might take a few moments for the posts to show in the new channel.
				</AppTranslate>
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
