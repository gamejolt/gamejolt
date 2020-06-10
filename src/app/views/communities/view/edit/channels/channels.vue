<template>
	<app-communities-view-page-container full>
		<app-community-perms :community="community" required="community-channels">
			<h2 class="section-header">
				<translate>Channels</translate>
			</h2>

			<div class="page-help">
				<p>
					<translate>
						Channels make it easy for your community members to organize their posts into indvidual
						sub-topics.
					</translate>
				</p>
			</div>

			<form-community-channel
				:community="community"
				@submit="onChannelAdded"
				:channels="community.channels"
			/>

			<app-card-list
				:items="communityPresetChannels"
				:active-item="activeItem"
				@activate="activeItem = $event"
			>
				<app-community-channel-preset-list-item
					v-for="presetType of communityPresetChannels"
					:key="presetType"
					:community="community"
					:preset-type="presetType"
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
						:key="channel.id"
						:id="`channel-container-${channel.id}`"
						:item="channel"
					>
						<div class="-row">
							<div class="-channel-img-preview">
								<img v-if="channel.background" :src="channel.background.mediaserver_url" />
							</div>

							<div class="card-title">
								<h5>{{ channel.title }}</h5>
							</div>

							<a
								v-if="canRemoveChannel"
								class="-remove"
								@click.stop="onClickRemoveChannel(channel)"
								v-app-tooltip="$gettext(`Remove Channel`)"
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
@require '~styles/variables'
@require '~styles-lib/mixins'

.-row
	display: flex
	align-items: center

	.-remove
		color: var(--theme-fg-muted)
		margin-left: auto

		&, .jolticon
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

<script lang="ts" src="./channels"></script>
