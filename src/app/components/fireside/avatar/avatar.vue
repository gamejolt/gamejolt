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

							<a
								v-if="canFeatureCommunity(i.community)"
								class="list-group-item has-icon"
								@click="toggleFeatured(i)"
							>
								<app-jolticon icon="star" />
								<translate v-if="i.isFeatured">Unfeature fireside</translate>
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

				<translate v-if="fireside.is_draft">DRAFT</translate>
				<translate v-else-if="isLive">LIVE</translate>
				<translate v-else>CHAT</translate>
			</div>
		</template>

		<template #title>
			{{ title }}
		</template>

		<template #link>
			<app-popper trigger="hover" no-hover-popover>
				<template #default>
					<router-link class="-link" :to="fireside.location" />
				</template>

				<template #popover>
					<div class="-tooltip">
						<div class="-tooltip-row -tooltip-members">
							<app-chat-user-online-status is-online :absolute="false" />
							<translate
								:translate-n="fireside.member_count || 0"
								:translate-params="{
									count: formatNumber(fireside.member_count || 0),
								}"
								translate-plural="%{ count } members"
							>
								%{ count } member
							</translate>
						</div>

						<hr />

						<div class="-tooltip-row -tooltip-user">
							<translate>by</translate>
							{{ ' ' }}
							<app-user-avatar-img class="-tooltip-img" :user="fireside.user" />
							{{ ' ' }}
							@{{ fireside.user.username }}
						</div>

						<div v-if="community" class="-tooltip-row -tooltip-community">
							<translate>in</translate>
							<app-community-thumbnail-img
								class="-tooltip-img"
								:community="community"
							/>
							{{ community.name }}
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
