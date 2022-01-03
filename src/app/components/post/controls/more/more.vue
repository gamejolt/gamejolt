<script lang="ts" src="./more"></script>

<template>
	<app-popper popover-class="fill-darkest">
		<app-button sparse circle trans icon="ellipsis-v" />

		<template #popover>
			<div class="list-group list-group-dark">
				<a
					v-app-track-event="`copy-link:post`"
					class="list-group-item has-icon"
					@click="copyShareUrl"
				>
					<app-jolticon icon="link" />
					<translate>Copy link to post</translate>
				</a>

				<template v-if="shouldShowPins">
					<a class="list-group-item has-icon" @click="togglePin">
						<app-jolticon icon="thumbtack" />

						<translate v-if="post.is_pinned">Unpin</translate>
						<translate v-else>Pin</translate>
					</a>
				</template>

				<!-- User reports -->
				<a
					v-if="user && user.id !== post.user.id"
					class="list-group-item has-icon"
					@click="report"
				>
					<app-jolticon icon="flag" />
					<translate>Report post</translate>
				</a>

				<!-- Remove -->
				<a v-if="canEdit" class="list-group-item has-icon" @click.stop="remove()">
					<app-jolticon icon="remove" notice />
					<translate>Remove</translate>
				</a>

				<!-- Moderate -->
				<a
					v-if="shouldShowModTools"
					class="list-group-item has-icon"
					:href="siteModerateLink"
					target="_blank"
				>
					<app-jolticon icon="cog" />
					<translate>Moderate</translate>
				</a>

				<!-- When published to platforms, shows links to created resources. -->
				<template v-if="canEdit && post.platforms_published_to.length > 0">
					<hr />
					<div class="-header list-group-item">
						<translate>Published to:</translate>
					</div>
					<app-link-external
						v-for="platform of post.platforms_published_to"
						:key="platform.url"
						class="list-group-item has-icon"
						:href="platform.url"
					>
						<app-jolticon :icon="getProviderIcon(platform.created_resource_provider)" />
						{{ platform.created_resource_account_name }}
					</app-link-external>
				</template>

				<!-- Community feature/unfeature, move to channel and eject -->
				<template v-if="shouldShowManageCommunities">
					<div v-for="i of post.manageableCommunities" :key="i.id">
						<hr />
						<h5 class="-header list-group-item has-icon">
							<app-community-thumbnail-img :community="i.community" />
							{{ i.community.name }}
						</h5>
						<app-community-perms :community="i.community" required="community-features">
							<a class="list-group-item has-icon" @click.stop="toggleFeatured(i)">
								<app-jolticon icon="star" />
								<template v-if="i.isFeatured">
									<translate :translate-params="{ community: i.community.name }">
										Unfeature from %{ community }
									</translate>
								</template>
								<template v-else>
									<translate :translate-params="{ community: i.community.name }">
										Feature in %{ community }
									</translate>
								</template>
							</a>
						</app-community-perms>

						<app-community-perms :community="i.community" required="community-posts">
							<a
								class="list-group-item has-icon"
								@click.stop="movePostFromCommunityChannel(i)"
							>
								<app-jolticon icon="arrow-forward" />
								<translate>Move to a different channel</translate>
							</a>

							<a
								class="list-group-item has-icon"
								@click.stop="rejectFromCommunity(i)"
							>
								<app-jolticon icon="eject" />

								<translate :translate-params="{ community: i.community.name }">
									Eject from %{ community }
								</translate>
							</a>
						</app-community-perms>

						<app-community-perms
							v-if="shouldShowBlockCommunityUser"
							:community="i.community"
							required="community-blocks"
						>
							<a class="list-group-item has-icon" @click.stop="blockFromCommunity(i)">
								<app-jolticon icon="friend-remove-2" />
								<translate :translate-params="{ community: i.community.name }">
									Block author from %{ community }
								</translate>
							</a>
						</app-community-perms>
					</div>
				</template>
			</div>
		</template>
	</app-popper>
</template>

<style lang="stylus" scoped>
.-header
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
