<script lang="ts" src="./view"></script>

<template>
	<app-shell-content-with-sidebar v-if="community">
		<template #default>
			<!-- Community Header Image -->
			<app-editable-overlay
				v-if="coverEditable"
				:class="{ '-cover-img': !!coverMediaItem }"
				:disabled="!coverEditable"
				@click="showEditHeader()"
			>
				<template #overlay>
					<translate v-if="!coverMediaItem">Upload Header</translate>
					<translate v-else>Change Header</translate>
				</template>

				<!-- If no cover media, reserve space with a min-height. -->
				<template #default>
					<div
						class="fill-gray"
						:style="{
							'min-height': !coverMediaItem ? '200px' : '',
						}"
					>
						<app-media-item-cover v-if="coverMediaItem" :media-item="coverMediaItem" />
					</div>
				</template>
			</app-editable-overlay>
			<div v-else-if="!!coverMediaItem && isShowingHeader" class="-cover-img">
				<app-media-item-cover :media-item="coverMediaItem" />
			</div>

			<!-- Mobile Header -->
			<template v-if="!routeStore.isShowingSidebar && !isEditing">
				<app-mobile-header :has-unread="hasUnreadPosts" />
			</template>

			<router-view />
		</template>
	</app-shell-content-with-sidebar>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-cover-img
	position: relative

	&::after
		content: ''
		position: absolute
		bottom: 0
		left: 0
		right: 0
		height: 150px
		max-height: 50%
		background-image: linear-gradient(to bottom, transparent 0, rgba($black, 0.3) 70%, rgba($black, 0.6) 100%)
		z-index: 0
</style>
