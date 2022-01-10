<script lang="ts" src="./list"></script>

<template>
	<app-communities-view-page-container>
		<app-community-perms
			:community="community"
			required="community-channels,community-competitions"
			either
		>
			<h2 class="section-header">
				<translate>Channels</translate>
			</h2>

			<div class="page-help">
				<p>
					<translate>
						Channels make it easy for your community members to organize their posts
						into individual sub-topics.
					</translate>
				</p>
			</div>

			<app-card-list
				v-if="hasFullChannelsPermission"
				:items="communityPresetChannels"
				:active-item="activeItem"
				:is-adding="isShowingChannelAdd"
				@activate="onActivate"
			>
				<app-card-list-add
					:label="$gettext(`Add Channel`)"
					@toggle="isShowingChannelAdd = !isShowingChannelAdd"
				>
					<form-community-channel-add
						:community="community"
						:channels="community.channels"
						:archived-channels="routeStore.archivedChannels"
						@submit="onChannelAdded"
					/>
				</app-card-list-add>

				<app-communities-edit-channel-list-preset-item
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
				:is-draggable="hasFullChannelsPermission"
			>
				<app-card-list-draggable item-key="id" @change="saveChannelSort">
					<template #item="{ element: channel }">
						<app-communities-edit-channel-list-item :channel="channel" />
					</template>
				</app-card-list-draggable>
			</app-card-list>

			<template v-if="community.has_archived_channels">
				<h3 class="-archived-heading" @click="onClickArchivedChannels">
					<app-jolticon
						:icon="
							routeStore.expandedArchivedChannels ? 'chevron-down' : 'chevron-right'
						"
					/>
					<translate>Archived Channels</translate>
				</h3>

				<template v-if="routeStore.expandedArchivedChannels">
					<template v-if="routeStore.archivedChannels.length">
						<app-card-list
							:items="routeStore.archivedChannels"
							:is-draggable="hasFullChannelsPermission"
						>
							<app-card-list-draggable
								item-key="id"
								@change="saveChannelSortArchived"
							>
								<template #item="{ element: channel }">
									<app-communities-edit-channel-list-item :channel="channel" />
								</template>
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
.-archived-heading
	margin-top: 24px
	user-select: none
	cursor: pointer
</style>
