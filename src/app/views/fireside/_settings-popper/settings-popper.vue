<script lang="ts" src="./settings-popper"></script>

<template>
	<app-popper popover-class="fill-darkest" @show="emitShow" @hide="emitHide">
		<slot />

		<template #popover>
			<div class="list-group list-group-dark">
				<a
					v-if="!fireside.is_draft"
					class="list-group-item has-icon"
					@click="onClickCopyLink"
				>
					<app-jolticon icon="link" />
					<translate>Copy Link</translate>
				</a>

				<a v-if="shouldMute" class="list-group-item" @click="muteAll()">
					<app-jolticon icon="audio-mute" />
					<translate>Mute All Users</translate>
				</a>
				<a v-else class="list-group-item" @click="unmuteAll()">
					<app-jolticon icon="audio" />
					<translate>Unmute All Users</translate>
				</a>

				<a class="list-group-item has-icon" @click="onClickShowChatMembers">
					<app-jolticon icon="users" />
					<translate>Chat Members</translate>
				</a>

				<a v-if="c.canReport" class="list-group-item has-icon" @click="onClickReport">
					<app-jolticon icon="flag" />
					<translate>Report Fireside</translate>
				</a>

				<a v-if="canEdit" class="list-group-item has-icon" @click="onClickEditFireside">
					<app-jolticon icon="edit" />
					<translate>Edit Fireside</translate>
				</a>

				<a
					v-if="c.canManageCohosts"
					class="list-group-item has-icon"
					@click="onClickManageCohosts"
				>
					<app-jolticon icon="friends" />
					<translate>Manage Hosts</translate>
				</a>

				<template v-if="shouldShowStreamSettings">
					<a class="list-group-item has-icon" @click="onClickEditStream">
						<app-jolticon icon="broadcast" />
						<translate v-if="isStreaming">Stream Settings</translate>
						<translate v-else>Start Stream / Voice Chat</translate>
					</a>
				</template>

				<template v-if="c.canPublish">
					<hr />
					<a class="list-group-item has-icon" @click="onClickPublish">
						<app-jolticon icon="notifications" highlight />
						<translate>Publish Fireside</translate>
					</a>
				</template>

				<template v-if="isStreaming || c.canExtinguish">
					<hr />

					<a
						v-if="isStreaming"
						class="list-group-item has-icon"
						@click="onClickStopStreaming"
					>
						<app-jolticon icon="plug" notice />
						<translate>Stop Streaming</translate>
					</a>

					<a
						v-if="c.canExtinguish"
						class="list-group-item has-icon"
						@click="onClickExtinguish"
					>
						<app-jolticon icon="remove" notice />
						<translate>Extinguish Fireside</translate>
					</a>
				</template>

				<template v-if="!fireside.is_draft">
					<div v-for="i in manageableCommunities" :key="i.id">
						<hr />

						<h5 class="-extras-header list-group-item has-icon">
							<app-community-thumbnail-img :community="i.community" />
							{{ i.community.name }}
						</h5>

						<!-- DISABLED_ALLOW_FIRESIDES -->
						<!-- <a class="list-group-item has-icon" @click="toggleFeatured(i)">
							<app-jolticon icon="star" />

							<translate v-if="i.isFeatured"> Unfeature fireside </translate>
							<translate v-else>Feature fireside</translate>
						</a> -->

						<a class="list-group-item has-icon" @click="ejectFireside(i)">
							<app-jolticon icon="eject" />

							<translate>Eject fireside</translate>
						</a>
					</div>
				</template>
			</div>
		</template>
	</app-popper>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'
</style>
