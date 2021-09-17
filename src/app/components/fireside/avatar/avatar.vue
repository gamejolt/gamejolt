<script lang="ts" src="./avatar"></script>

<template>
	<div class="fireside-avatar">
		<div class="-header">
			<div class="-avatar">
				<div class="-avatar-inner">
					<div v-if="isLive" class="-avatar-anim" />

					<app-media-item-backdrop
						class="-avatar-img"
						:media-item="fireside.user.avatar_media_item"
					>
						<app-user-avatar-img :user="fireside.user" />
					</app-media-item-backdrop>

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

			<div v-if="community" class="-community">
				<app-community-thumbnail-img class="-community-img" :community="community" />
			</div>

			<div class="-tag" :class="{ '-live': isLive }">
				<app-jolticon v-if="isFeaturedInCommunity" icon="star" />

				<translate v-if="isLive">LIVE</translate>
				<translate v-else>CHAT</translate>
			</div>
		</div>

		<div class="-title">
			{{ title }}
		</div>

		<router-link
			v-app-tooltip="`${fireside.user.display_name} (@${fireside.user.username})`"
			class="-link"
			:to="fireside.location"
		/>
	</div>
</template>

<style lang="stylus" scoped>
@import './common'
</style>
