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
								<app-community-thumbnail-img :community="i.community" />
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
			<router-link
				v-app-tooltip="`${fireside.user.display_name} (@${fireside.user.username})`"
				:to="fireside.location"
			/>
		</template>
	</app-fireside-avatar-base>
</template>

<style lang="stylus" scoped>
@import './common'
</style>
