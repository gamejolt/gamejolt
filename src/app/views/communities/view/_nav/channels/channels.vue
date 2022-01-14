<script lang="ts" src="./channels"></script>

<template>
	<div>
		<app-community-channel-card
			:community="community"
			:path="frontpageChannel.title"
			:label="$gettext(`Frontpage`)"
			:background-item="frontpageChannel.background"
			:is-active="activeChannel === frontpageChannel"
			:is-unread="isChannelUnread(frontpageChannel)"
			@click="store.toggleLeftPane()"
		/>

		<app-community-channel-card
			:community="community"
			:path="allChannel.title"
			sort="hot"
			:label="$gettext(`All Posts`)"
			:background-item="allChannel.background"
			:is-active="activeChannel === allChannel"
			:is-unread="isChannelUnread(allChannel)"
			@click="store.toggleLeftPane()"
		/>

		<h5 class="-heading">
			<translate>Channels</translate>
		</h5>

		<template v-if="community.channels">
			<app-community-channel-card
				v-for="channel of community.channels"
				:key="channel.id"
				:community="community"
				:path="channel.title"
				:label="channel.displayTitle"
				:background-item="channel.background"
				:is-active="activeChannel === channel"
				:is-unread="isChannelUnread(channel)"
				:is-locked="isChannelLocked(channel)"
				:is-unpublished="isChannelUnpublished(channel)"
				:channel-type="channel.type"
				@click="store.toggleLeftPane()"
			/>
		</template>

		<template v-if="community.has_archived_channels">
			<h5 class="-heading -archived-heading" @click="onClickArchivedChannels">
				<app-jolticon
					:icon="routeStore.expandedArchivedChannels ? 'chevron-down' : 'chevron-right'"
				/>
				<translate>Archived Channels</translate>
			</h5>

			<template
				v-if="
					routeStore.expandedArchivedChannels ||
					(activeChannel && activeChannel.is_archived)
				"
			>
				<template v-if="routeStore.archivedChannels.length">
					<app-community-channel-card
						v-for="channel of routeStore.archivedChannels"
						:key="channel.id"
						:community="community"
						:path="channel.title"
						:label="channel.displayTitle"
						:background-item="channel.background"
						:is-active="activeChannel === channel"
						:is-unread="isChannelUnread(channel)"
						:is-locked="isChannelLocked(channel)"
						:is-archived="channel.is_archived"
						:is-unpublished="isChannelUnpublished(channel)"
						:channel-type="channel.type"
						@click="store.toggleLeftPane()"
					/>
				</template>

				<template v-if="isLoadingArchivedChannels">
					<app-loading centered />
				</template>
			</template>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-heading
	margin-top: 24px

.-archived-heading
	user-select: none
	cursor: pointer
</style>
