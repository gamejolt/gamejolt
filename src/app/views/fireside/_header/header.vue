<script lang="ts" src="./header"></script>

<template>
	<div class="fireside-header">
		<template v-if="fireside">
			<div class="-fireside-title">
				<h2 class="sans-margin-top" :class="{ h3: Screen.isXs }">
					<small class="-subtitle">
						<router-link
							:to="{
								name: 'profile.overview',
								params: { username: fireside.user.username },
							}"
						>
							@{{ fireside.user.username }}
						</router-link>
						<app-user-avatar-img class="-avatar" :user="fireside.user" />
						<span>'s Fireside</span>

						<template v-if="fireside.community">
							<span>in </span>
							<div class="-avatar -community-avatar">
								<app-community-thumbnail-img :community="fireside.community" />
							</div>
							<router-link :to="fireside.community.routeLocation">
								{{ fireside.community.name }}
							</router-link>
						</template>

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

					<app-popper
						popover-class="fill-darkest"
						@show="onShowPopper"
						@hide="onHidePopper"
					>
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

								<div v-for="i in manageableCommunities" :key="i.id">
									<hr />

									<h5 class="-extras-header list-group-item has-icon">
										<app-community-thumbnail-img :community="i.community" />
										{{ i.community.name }}
									</h5>

									<a class="list-group-item has-icon" @click="toggleFeatured(i)">
										<app-jolticon icon="star" />

										<translate v-if="i.isFeatured">
											Unfeature fireside
										</translate>
										<translate v-else>Feature fireside</translate>
									</a>

									<a class="list-group-item has-icon" @click="ejectFireside(i)">
										<app-jolticon icon="eject" />

										<translate>Eject fireside</translate>
									</a>
								</div>
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

.-extras-header
	font-family: $font-family-heading
	font-size: $font-size-tiny
	font-weight: normal
	letter-spacing: 0.1em
	line-height: 1
	text-transform: uppercase
	margin-top: 0
	margin-bottom: 0

	img
		width: $list-group-icon-width * 0.8
		height: $list-group-icon-width * 0.8
		border-radius: 50%
		display: inline-block
		position: relative
		left: -($list-group-icon-width - 1px)
		top: -2px
		margin-right: -($list-group-icon-width - 5px)
</style>
