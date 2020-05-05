<template>
	<app-popper popover-class="fill-darkest">
		<app-button sparse circle trans icon="ellipsis-v" />

		<div slot="popover">
			<!-- When published to platforms, shows links to created resources. -->
			<template v-if="canEdit && post.platforms_published_to.length > 0">
				<div class="popper-heading">
					<translate>Published to:</translate>
				</div>
				<div class="list-group list-group-dark" style="margin-bottom: 0">
					<app-link-external
						v-for="platform of post.platforms_published_to"
						:key="platform.url"
						class="list-group-item has-icon"
						:href="platform.url"
					>
						<app-jolticon :icon="getProviderIcon(platform.created_resource_provider)" />
						{{ platform.created_resource_account_name }}
					</app-link-external>
				</div>

				<hr />
			</template>

			<div class="list-group list-group-dark">
				<a
					class="list-group-item has-icon"
					@click="copyShareUrl"
					v-app-track-event="`copy-link:post`"
				>
					<app-jolticon icon="link" />
					<translate>Copy link to post</translate>
				</a>

				<template v-if="shouldShowPins">
					<a class="list-group-item has-icon" v-if="post.is_pinned" @click="unpin">
						<app-jolticon icon="thumbtack" />
						<translate>Unpin</translate>
					</a>
					<a class="list-group-item has-icon" v-else @click="pin">
						<app-jolticon icon="thumbtack" />
						<translate>Pin</translate>
					</a>
				</template>

				<!-- Community feature/unfeature, move to channel and eject -->
				<template v-if="shouldShowManageCommunities">
					<span v-for="i of post.manageableCommunities" :key="i.id">
						<app-community-perms :community="i.community" required="community-features">
							<a class="list-group-item has-icon" @click.stop="toggleFeatured(i)">
								<app-jolticon icon="tag" />
								<template v-if="i.isFeatured">
									<template v-if="shouldDisplayCommunityName(i.community)">
										<translate :translate-params="{ community: i.community.name }">
											Unfeature from %{ community }
										</translate>
									</template>
									<template v-else>
										<translate>
											Unfeature
										</translate>
									</template>
								</template>
								<template v-else>
									<template v-if="shouldDisplayCommunityName(i.community)">
										<translate :translate-params="{ community: i.community.name }">
											Feature in %{ community }
										</translate>
									</template>
									<template v-else>
										<translate>
											Feature
										</translate>
									</template>
								</template>
							</a>
						</app-community-perms>

						<app-community-perms :community="i.community" required="community-posts">
							<a class="list-group-item has-icon" @click.stop="movePostFromCommunityChannel(i)">
								<app-jolticon icon="arrow-forward" />
								<translate>Move to a different channel</translate>
							</a>

							<a class="list-group-item has-icon" @click.stop="rejectFromCommunity(i)">
								<app-jolticon icon="remove" />

								<translate :translate-params="{ community: i.community.name }">
									Eject
									<template v-if="shouldDisplayCommunityName(i.community)">
										from %{ community }
									</template>
									<template v-else>
										from this community
									</template>
								</translate>
							</a>
						</app-community-perms>
					</span>
				</template>

				<!-- User reports -->
				<a class="list-group-item has-icon" v-if="user && user.id !== post.user.id" @click="report">
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
			</div>
		</div>
	</app-popper>
</template>

<script lang="ts" src="./extra"></script>
