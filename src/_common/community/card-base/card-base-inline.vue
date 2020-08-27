<script lang="ts" src="./card-base-inline"></script>

<template>
	<app-theme class="-community-card" :class="{ '-as-header': asHeader }" :theme="community.theme">
		<div class="-well" :class="{ '-overflow': overflow }">
			<!-- Thumbnail -->
			<div class="-thumbnail">
				<div class="-thumbnail-inner">
					<slot name="thumbnail" />
				</div>
				<app-community-verified-tick class="-verified" :community="community" />
			</div>

			<!-- Name / Members -->
			<div class="-details">
				<div v-app-tooltip.touchable="overflow ? null : community.name" class="-name">
					{{ community.name }}
				</div>

				<div class="-members small">
					<router-link
						v-translate="{ count: number(memberCount) }"
						:translate-n="memberCount"
						translate-plural="<b>%{count}</b> members"
						:to="{
							name: 'communities.view.members',
							params: { path: community.path },
						}"
					>
						<b>1</b>
						member
					</router-link>
				</div>
			</div>
		</div>

		<!-- Button Controls -->
		<div class="-controls">
			<!-- Context Menu -->
			<div v-if="shouldShowChannelsMenu" class="-controls-item -menu">
				<app-button icon="menu" trans @click="onClickMenu">
					<template v-if="!Screen.isXs">
						<translate v-if="routeStore.ChannelPath">
							Channels
						</translate>
						<translate v-else>
							Menu
						</translate>
					</template>
				</app-button>
			</div>

			<!-- Join / Edit / View -->
			<div class="-controls-item -controls-primary">
				<template v-if="community.hasPerms()">
					<app-button v-if="!isEditing" primary block :to="community.routeEditLocation">
						<translate>Edit Community</translate>
					</app-button>
					<app-button v-else primary block :to="community.routeLocation">
						<translate>View Community</translate>
					</app-button>
				</template>
				<app-community-join-widget
					v-else
					:community="community"
					:disabled="!!community.user_block"
					block
					hide-count
					event-label="community-card"
				/>
			</div>

			<!-- About -->
			<div v-if="shouldShowAbout" class="-controls-item -about">
				<app-button trans @click="onClickAbout">
					About
				</app-button>
			</div>

			<!-- Popover Extras -->
			<app-popper class="-controls-item -extra" popover-class="fill-darkest">
				<app-button class="link-unstyled" icon="ellipsis-v" trans sparse circle />

				<template #popover>
					<div class="list-group list-group-dark">
						<a
							v-app-track-event="`copy-link:community`"
							class="list-group-item has-icon"
							@click="copyShareUrl"
						>
							<app-jolticon icon="link" />
							<translate>Copy link to community</translate>
						</a>
						<a
							v-if="shouldShowModTools"
							class="list-group-item has-icon"
							:href="
								Environment.baseUrl + `/moderate/communities/view/${community.id}`
							"
							target="_blank"
							@click="onClickExtrasOption"
						>
							<app-jolticon icon="cog" />
							<span>Moderate Community</span>
						</a>
					</div>
				</template>
			</app-popper>
		</div>
	</app-theme>
</template>

<style lang="stylus" src="./card-base-inline.styl" scoped></style>
