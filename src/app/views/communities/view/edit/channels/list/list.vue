<script lang="ts" src="./list"></script>

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

			<app-card-list v-if="community.channels" :items="community.channels">
				<app-card-list-draggable @change="saveChannelSort">
					<app-communities-edit-channel-list-item
						v-for="channel of community.channels"
						:key="channel.id"
						:channel="channel"
					/>
				</app-card-list-draggable>
			</app-card-list>

			<template v-if="community.has_archived_channels">
				<h3 class="-archived-heading" @click="onClickArchivedChannels">
					<app-jolticon
						:icon="
							community._expandedArchivedChannels ? 'chevron-down' : 'chevron-right'
						"
					/>
					<translate>Archived Channels</translate>
				</h3>

				<template v-if="community._expandedArchivedChannels">
					<template v-if="community.archivedChannels.length">
						<app-card-list :items="community.archivedChannels">
							<app-card-list-draggable @change="saveChannelSortArchived">
								<app-communities-edit-channel-list-item
									v-for="channel of community.archivedChannels"
									:key="channel.id"
									:channel="channel"
								/>
							</app-card-list-draggable>
						</app-card-list>
					</template>

					<template v-if="isLoadingArchivedChannels">
						<app-loading centered />
					</template>
				</template>
			</template>
		</app-community-perms>
	</app-communities-view-page-container>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-archived-heading
	margin-top: 24px
	user-select: none
	cursor: pointer
</style>
