<template>
	<div>
		<div class="-manage">
			<div class="-stats">
				<template v-if="shouldShowStats">
					<translate
						:translate-n="post.view_count || 0"
						:translate-params="{ count: number(post.view_count || 0) }"
						translate-plural="%{ count } views"
					>
						%{ count } view
					</translate>

					<span class="dot-separator" />

					<translate
						:translate-n="post.expand_count || 0"
						:translate-params="{ count: number(post.expand_count || 0) }"
						translate-plural="%{ count } expands"
					>
						%{ count } expand
					</translate>

					<span
						class="hidden-xs"
						v-app-tooltip="
							$gettext(
								'An expand is some sort of interaction with your post. For example, playing a video post, or clicking into your post.'
							)
						"
					>
						<app-jolticon icon="help-circle" />
					</span>
				</template>
			</div>

			<div
				class="-controls"
				v-if="shouldShowEdit || shouldShowManageCommunities || shouldShowModTools"
			>
				<template v-if="shouldShowEdit">
					<app-button v-if="canPublish" primary @click="publish()">
						<translate>Publish</translate>
					</app-button>
					<app-button @click="openEdit()">
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
								<a
									v-for="platform of post.platforms_published_to"
									:key="platform.id"
									class="list-group-item has-icon"
									:href="platform.url"
									target="_blank"
									rel="nofollow noopener"
								>
									<app-jolticon :icon="getProviderIcon(platform.created_resource_provider)" />
									{{ platform.created_resource_account_name }}
								</a>
							</div>

							<hr />
						</template>

						<div class="list-group list-group-dark">
							<span
								v-if="shouldShowManageCommunities"
								v-for="i of post.manageableCommunities"
								:key="i.id"
							>
								<a class="list-group-item has-icon" @click.stop="toggleFeatured(i)">
									<app-jolticon icon="tag" />

									<translate
										v-if="i.isFeatured"
										:translate-params="{ community: i.community.name }"
									>
										Unfeature: %{ community }
									</translate>

									<translate v-else :translate-params="{ community: i.community.name }">
										Feature: %{ community }
									</translate>
								</a>

								<a class="list-group-item has-icon" @click.stop="rejectFromCommunity(i)">
									<app-jolticon icon="remove" notice />

									<translate :translate-params="{ community: i.community.name }">
										Remove: %{ community }
									</translate>
								</a>
							</span>

							<a v-if="shouldShowEdit" class="list-group-item has-icon" @click.stop="remove()">
								<app-jolticon icon="remove" notice />
								<translate>Remove Post</translate>
							</a>

							<a
								v-if="shouldShowModTools"
								class="list-group-item has-icon"
								:href="Environment.baseUrl + `/moderate/fireside-posts/view/${post.id}`"
								target="_blank"
							>
								<app-jolticon icon="cog" />
								<translate>Moderate Post</translate>
							</a>
						</div>
					</div>
				</app-popper>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-manage
	display: flex
	align-items: center

.-stats
	theme-prop('color', 'fg-muted')
	flex: auto
	font-size: $font-size-small

.-controls
	flex: none
</style>

<script lang="ts" src="./manage"></script>
