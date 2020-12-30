<script lang="ts" src="./channels"></script>

<template>
	<app-communities-view-page-container>
		<app-community-perms :community="community" required="community-channels">
			<h2 class="section-header">
				<translate>Channels</translate>
			</h2>

			<div class="page-help">
				<p>
					<translate>
						Channels make it easy for your community members to organize their posts
						into indvidual sub-topics.
					</translate>
				</p>
			</div>

			<app-card-list
				:items="communityPresetChannels"
				:active-item="activeItem"
				:is-adding="isShowingChannelAdd"
				@activate="activeItem = $event"
			>
				<app-card-list-add
					:label="$gettext(`Add Channel`)"
					@toggle="isShowingChannelAdd = !isShowingChannelAdd"
				>
					<form-community-channel-add
						:community="community"
						:channels="community.channels"
						@submit="onChannelAdded"
					/>
				</app-card-list-add>

				<app-community-channel-preset-list-item
					v-for="presetType of communityPresetChannels"
					:key="presetType"
					:community="community"
					:preset-type="presetType"
					@edit="onPresetListItemSaved"
				/>
			</app-card-list>

			<app-card-list
				v-if="community.channels"
				:items="community.channels"
				:active-item="activeItem"
				@activate="activeItem = $event"
			>
				<app-card-list-draggable @change="saveChannelSort">
					<app-card-list-item
						v-for="channel in community.channels"
						:id="`channel-container-${channel.id}`"
						:key="channel.id"
						:item="channel"
					>
						<div class="-row">
							<div class="-channel-img-preview">
								<img
									v-if="channel.background"
									:src="channel.background.mediaserver_url"
								/>
							</div>

							<div class="card-title">
								<div v-if="channel.hasDisplayTitle" class="text-muted">
									{{ channel.displayTitle }}
								</div>
								<h5>
									<app-jolticon
										v-if="channel.type === 'competition'"
										v-app-tooltip.bottom="$gettext(`Channel contains Game Jam`)"
										icon="jams"
									/>
									{{ channel.title }}
								</h5>
							</div>

							<a
								v-if="canRemoveChannel"
								v-app-tooltip="$gettext(`Remove Channel`)"
								class="-remove"
								@click.stop="onClickRemoveChannel(channel)"
							>
								<app-jolticon icon="remove" />
							</a>
						</div>

						<template slot="body">
							<form-community-channel-edit :community="community" :model="channel" />
						</template>
					</app-card-list-item>
				</app-card-list-draggable>
			</app-card-list>
		</app-community-perms>
	</app-communities-view-page-container>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-row
	display: flex
	align-items: center

	.-remove
		color: var(--theme-fg-muted)
		margin-left: auto

		&
		.jolticon
			cursor: pointer
			vertical-align: middle

		&:hover
			color: $white !important

.-channel-img-preview
	rounded-corners()
	display: flex
	align-items: center
	width: 96px
	height: 25px
	overflow: hidden

	> img
		width: 100%

.card-title
	margin-left: 16px
	margin-bottom: 0

	> *
		text-overflow()
</style>
