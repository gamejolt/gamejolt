<template>
	<div>
		<div v-if="shouldShowKnownMembers">
			<h5 class="section-header">
				<translate
					:translate-n="knownMemberCount"
					:translate-params="{ count: membersYouKnowCount }"
					translate-plural="%{ count } members you know"
				>
					1 member you know
				</translate>
			</h5>
			<app-user-avatar-list :users="knownMembers" />
			<br />
		</div>

		<app-community-description :community="community" :is-editing="isEditing" />

		<template v-if="community.game">
			<br />
			<app-game-thumbnail :game="community.game" class="-community-game" />
		</template>

		<div v-if="shouldShowCollabSection" class="-mod-list">
			<div class="clearfix">
				<div class="pull-right" v-if="shouldShowLoadMoreCollaborators">
					<app-button trans :disabled="isLoadingMoreCollaborators" @click="toggleCollaboratorList">
						<translate
							v-if="collaboratorListCollapsed || isLoadingMoreCollaborators || hasMoreCollaborators"
						>
							View All
						</translate>
						<translate v-else>Show fewer</translate>
					</app-button>
				</div>

				<h5 class="section-header">
					<translate>Moderators</translate>
				</h5>
			</div>

			<div v-for="user of moderators" :key="user.id" class="-mod-list-entry">
				<app-user-card-hover :user="user">
					<router-link :to="user.url">
						<span>
							@{{ user.username }}
							<span class="-mod-avatar-container">
								<img
									key="user"
									:src="user.img_avatar"
									class="img-responsive -mod-avatar-img"
									alt=""
								/>
								<app-jolticon class="-mod-verified" v-if="user.is_verified" icon="verified" />
							</span>
						</span>
					</router-link>
				</app-user-card-hover>
				<span v-if="owner && user.id === owner.id" class="badge">
					<translate>owner</translate>
				</span>
			</div>
		</div>

		<div class="-community-end small">
			<app-popper @show="isShowingShare = true" @hide="isShowingShare = false">
				<a>
					<translate>Share this community</translate>
				</a>

				<div slot="popover" class="well fill-darkest sans-margin" v-if="isShowingShare">
					<div class="social-widgets" v-if="!GJ_IS_CLIENT">
						<app-social-twitter-share :url="shareUrl" :content="shareContent" />

						<span class="dot-separator"></span>

						<app-social-facebook-like :url="shareUrl" />
					</div>

					<app-button block @click="copyShareUrl">
						<translate>Copy Permalink</translate>
					</app-button>
				</div>
			</app-popper>

			<div class="text-muted ">
				A community for
				<app-time-ago :date="community.added_on" without-suffix />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-community-game
	margin-bottom: 0

.-mod-list-entry
	margin-bottom: ($line-height-computed / 4)

	&> div
		display: inline-block !important

.-mod-avatar-container
	position: relative
	display: inline-block

.-mod-avatar-img
	display: inline
	height: 1.5em
	img-circle()

.-mod-verified
	position: absolute
	right: -4px
	bottom: -4px
	change-bg('bg-offset')
	border-radius: 100%
	font-size: 14px

.-mod-list
	margin-top: $line-height-computed

.-community-end
	margin-top: $line-height-computed * 1.5

</style>

<script lang="ts" src="./sidebar"></script>
