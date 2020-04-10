<template>
	<div>
		<app-community-perms :community="community" required="community-channels">
			<h2 class="section-header">
				<translate>Channels</translate>
			</h2>

			<div class="page-help">
				<p>
					<translate>
						Channels make it easier for your community members to organize their posts into groups.
					</translate>
				</p>
				<p>
					<translate>
						Create new channels or edit the below channels for your community.
					</translate>
				</p>
			</div>

			<form-community-channel
				:community="community"
				@submit="onChannelAdded"
				:channels="community.channels"
			/>

			<app-card-list
				:items="community.channels"
				:active-item="activeItem"
				@activate="activeItem = $event"
			>
				<app-card-list-item :id="`channel-container-featured`" :item="community">
					<div class="row">
						<div class="col-xs-6 col-xs-offset-3 col-sm-2 col-sm-offset-0">
							<div v-if="community.featured_background" class="-channel-img-preview">
								<img :src="community.featured_background.mediaserver_url" />
							</div>

							<br class="visible-xs" />
						</div>
						<div class="col-xs-12 col-sm-10">
							<div class="card-title">
								<h5><translate>featured</translate></h5>
							</div>
						</div>
					</div>
					<template slot="body">
						<form-community-channel-edit-featured
							:model="community"
							@save="featuredBackgroundEdited"
							@clear="featuredBackgroundEdited"
						/>
					</template>
				</app-card-list-item>
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
						<div class="row">
							<div class="col-xs-6 col-xs-offset-3 col-sm-2 col-sm-offset-0">
								<div v-if="channel.background" class="-channel-img-preview">
									<img :src="channel.background.mediaserver_url" />
								</div>

								<br class="visible-xs" />
							</div>
							<div class="col-xs-12 col-sm-10">
								<a
									v-if="canRemoveChannel"
									class="card-remove"
									@click.stop="onClickRemoveChannel(channel)"
									v-app-tooltip="$gettext(`Remove Channel`)"
								>
									<app-jolticon icon="remove" />
								</a>

								<div class="card-title">
									<h5>{{ channel.title }}</h5>
								</div>
							</div>
						</div>

						<template slot="body">
							<form-community-channel-edit
								:community="community"
								:model="channel"
								@save="channelEdited"
								@clear="channelEdited"
							/>
						</template>
					</app-card-list-item>
				</app-card-list-draggable>
			</app-card-list>
		</app-community-perms>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-channel-img-preview
	rounded-corners()
	display: flex
	align-items: center
	width: 68px
	height: 25px
	overflow: hidden

	img
		width: 100%
</style>

<script lang="ts" src="./channels"></script>
