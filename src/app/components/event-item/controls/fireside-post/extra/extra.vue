<template>
	<span>
		<template v-if="shouldShowEdit">
			<app-button v-if="canPublish" class="-inline-button" primary @click="publish()">
				<translate>Publish</translate>
			</app-button>
			<app-button class="-inline-button" @click="openEdit()">
				<translate>Edit</translate>
			</app-button>
		</template>

		<app-popper>
			<app-button sparse circle trans icon="ellipsis-v" />

			<div slot="popover" class="fill-darkest">
				<template v-if="shouldShowEdit && post.platforms_published_to.length > 0">
					<div class="popper-heading">
						<translate>Published to:</translate>
					</div>
					<div class="list-group list-group-dark" style="margin-bottom: 0">
						<app-link-external
							v-for="platform of post.platforms_published_to"
							:key="platform.id"
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
					<template v-if="shouldShowManageCommunities">
						<span v-for="i of post.manageableCommunities" :key="i.id">
							<app-community-perms v-if="postIsActive" :community="i.community" required="community-features">
								<a class="list-group-item has-icon" @click.stop="toggleFeatured(i)">
									<template v-if="i.isFeatured">
										<app-jolticon icon="remove" />
										<template v-if="shouldDisplayCommunityName(i.community)">
											<translate :translate-params="{ community: i.community.name }">
												Unfeature : %{ community }
											</translate>
										</template>
										<template v-else>
											<translate>
												Unfeature
											</translate>
										</template>
									</template>
									<template v-else>
										<app-jolticon icon="tag" />
										<template v-if="shouldDisplayCommunityName(i.community)">
											<translate :translate-params="{ community: i.community.name }">
												Feature : %{ community }
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
									<app-jolticon icon="remove" notice />

									<translate :translate-params="{ community: i.community.name }">
										Eject
										<template v-if="shouldDisplayCommunityName(i.community)">
											: %{ community }
										</template>
										<template v-else>
											from this community
										</template>
									</translate>
								</a>
							</app-community-perms>
						</span>
					</template>

					<a v-if="shouldShowEdit" class="list-group-item has-icon" @click.stop="remove()">
						<app-jolticon icon="remove" notice />
						<translate>Remove Post</translate>
					</a>

					<a
						v-if="shouldShowModTools"
						class="list-group-item has-icon"
						:href="siteModerateLink"
						target="_blank"
					>
						<app-jolticon icon="cog" />
						<translate>Moderate Post</translate>
					</a>
				</div>
			</div>
		</app-popper>
	</span>
</template>

<style lang="stylus" scoped>
.-inline-button
	margin-right: 10px
</style>

<script lang="ts" src="./extra"></script>
