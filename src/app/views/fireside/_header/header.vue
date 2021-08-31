<script lang="ts" src="./header"></script>

<template>
	<div class="fireside-header">
		<template v-if="fireside">
			<div class="-fireside-title">
				<h2 class="sans-margin-top" :class="{ h3: Screen.isXs }">
					<small class="-subtitle">
						<template v-if="fireside.community">
							<router-link :to="fireside.community.routeLocation">
								{{ fireside.community.name }}
							</router-link>
							<div class="-avatar -community-avatar">
								<app-community-thumbnail-img :community="fireside.community" />
							</div>
						</template>
						<template v-else>
							<router-link
								:to="{
									name: 'profile.overview',
									params: { username: fireside.user.username },
								}"
							>
								@{{ fireside.user.username }}
							</router-link>
							<app-user-avatar-img class="-avatar" :user="fireside.user" />
						</template>
						<span>'s Fireside</span>

						<span v-if="c.isDraft" class="-draft-tag tag">
							<translate>Draft</translate>
						</span>
					</small>
					<br />
					{{ fireside.title }}
				</h2>
				<div v-if="hasChatStats && c.chatUsers" class="-fireside-title-member-stats">
					<ul class="stat-list">
						<a @click="onClickShowChatMembers">
							<li class="stat-big stat-big-smaller">
								<div class="stat-big-label">Members</div>
								<div class="stat-big-digit">
									{{ number(c.chatUsers.count) }}
								</div>
							</li>
						</a>
					</ul>
				</div>
				<div v-if="showControls" class="-fireside-title-controls">
					<div
						v-if="c.shouldShowStreamingOptions && !c.isPersonallyStreaming"
						class="-stats-btn"
					>
						<app-button
							v-app-tooltip="$gettext(`Start Streaming`)"
							icon="broadcast"
							circle
							trans
							@click="onClickEditStream"
						/>
					</div>

					<app-popper>
						<div class="-stats-btn">
							<app-button
								icon="cog"
								circle
								sparse
								:solid="c.hasExpiryWarning && hasInfo"
								:primary="c.hasExpiryWarning && hasInfo"
							/>
							<app-jolticon
								v-if="c.hasExpiryWarning && hasInfo"
								icon="notice"
								notice
								class="-stats-btn-warn"
							/>
						</div>

						<template #popover>
							<div class="list-group list-group-dark">
								<a class="list-group-item has-icon" @click="onClickCopyLink">
									<app-jolticon icon="link" />
									<translate>Copy Link</translate>
								</a>
								<a
									v-if="hasEdit"
									class="list-group-item has-icon"
									@click="onClickEditFireside"
								>
									<app-jolticon icon="edit" />
									<translate>Edit Fireside</translate>
								</a>
								<a
									v-if="hasChat"
									class="list-group-item has-icon"
									@click="onClickShowChatMembers"
								>
									<app-jolticon icon="users" />
									<translate>Chat Members</translate>
								</a>
								<a
									v-if="hasInfo"
									class="list-group-item has-icon"
									@click="onClickInfo"
								>
									<app-jolticon icon="fireside" :notice="c.hasExpiryWarning" />
									<translate>Fireside Info</translate>
								</a>

								<template
									v-if="c.shouldShowStreamingOptions && c.isPersonallyStreaming"
								>
									<a class="list-group-item has-icon" @click="onClickEditStream">
										<app-jolticon icon="broadcast" />
										<translate>Stream Settings</translate>
									</a>
									<a
										class="list-group-item has-icon"
										@click="onClickStopStreaming"
									>
										<app-jolticon icon="remove" notice />
										<translate>Stop Streaming</translate>
									</a>
								</template>
							</div>
						</template>
					</app-popper>
				</div>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-fireside-title
	display: flex
	align-items: center

	h2
		text-overflow()
		flex: auto

	&-member-stats
		flex: none
		margin-left: 12px
		margin-right: 24px

	&-controls
		flex: none
		margin-left: 12px
		white-space: nowrap

.-subtitle
	*
		vertical-align: middle

.-avatar
	width: 16px
	height: 16px
	display: inline-block

.-community-avatar
	overflow: hidden
	border-radius: 50%

.-stats-btn
	display: inline-block
	position: relative

	&-warn
		change-bg('bg-offset')
		rounded-corners()
		position: absolute
		left: -8px
		top: -8px
		pointer-events: none
		padding: 2px

.-draft-tag
	margin-left: 4px
</style>
