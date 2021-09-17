<script lang="ts" src="./avatar"></script>

<template>
	<app-fireside-avatar-base
		:avatar-media-item="fireside.user.avatar_media_item"
		:community="hideCommunity ? null : community"
		:is-live="isLive"
	>
		<template #extras>
			<app-popper v-if="canModerate" class="-extras" popover-class="fill-darkest">
				<template #default>
					<app-jolticon icon="cog" />
				</template>

				<template #popover>
					<div class="list-group list-group-dark">
						<div v-for="(i, index) in manageableCommunities" :key="i.id">
							<hr v-if="index !== 0" />

							<h5 class="-extras-header list-group-item has-icon">
								<app-community-thumbnail-img
									class="-img"
									:community="i.community"
								/>
								{{ i.community.name }}
							</h5>

							<a class="list-group-item has-icon" @click="toggleFeatured(i)">
								<app-jolticon icon="star" />

								<translate v-if="i.isFeatured"> Unfeature fireside </translate>
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
		</template>

		<template #avatar>
			<app-user-avatar-img :user="fireside.user" />
		</template>

		<template #tag>
			<div>
				<app-jolticon v-if="isFeaturedInCommunity" icon="star" />

				<translate v-if="isLive">LIVE</translate>
				<translate v-else>CHAT</translate>
			</div>
		</template>

		<template #title>
			{{ title }}
		</template>

		<template #link>
			<app-popper popover-class="fill-darkest" trigger="hover" :show-delay="500">
				<template #default>
					<router-link class="-link" :to="fireside.location" />
				</template>

				<template #popover>
					<div class="list-group list-group-dark">
						<router-link
							v-if="community"
							class="-extras-header list-group-item has-icon"
							:to="community.routeLocation"
						>
							<app-community-thumbnail-img class="-img" :community="community" />
							{{ community.name }}
						</router-link>

						<router-link class="-extras-header list-group-item" :to="fireside.user.url">
							{{ userString }}
						</router-link>

						<div class="-extras-header list-group-item">
							<translate
								:translate-n="fireside.member_count || 0"
								:translate-params="{
									count: number(fireside.member_count || 0),
								}"
								translate-plural="%{ count } members"
							>
								%{ count } member
							</translate>
						</div>
					</div>
				</template>
			</app-popper>
		</template>
	</app-fireside-avatar-base>
</template>

<style lang="stylus" scoped>
@import './common'
</style>
