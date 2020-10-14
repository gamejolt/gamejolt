<script lang="ts" src="./shell"></script>

<template>
	<div
		id="shell"
		:class="{
			'is-client-offline': Connection.isClientOffline,
			'left-pane-visible': ssrShouldShowSidebar || !!visibleLeftPane,
			'right-pane-visible': !!visibleRightPane,
			'has-cbar': ssrShouldShowSidebar || (hasCbar && !Screen.isXs),
			'has-cbar-mobile': hasCbar && Screen.isXs,
			'has-banner': hasBanner && !isShellHidden,
		}"
	>
		<!-- JODO: Remove -->
		<app-button
			style="height: 50px; width: 50px; position: fixed; top: 54px; left: 70px; z-index: 5000;"
			@click="testOpenDrawer()"
		/>

		<app-sticker-layer>
			<template v-if="isShellHidden">
				<slot />
			</template>
			<app-shell-body v-else>
				<slot />
			</app-shell-body>
		</app-sticker-layer>

		<app-shell-top-nav v-if="hasTopBar" />
		<app-shell-cbar />
		<app-shell-sidebar v-if="hasSidebar" />
		<app-shell-bottom-drawer />
		<app-shell-banner v-if="!isShellHidden" />

		<app-chat-windows v-if="chat" />

		<div v-if="GJ_IS_CLIENT" key="shell-client">
			<app-client-base />
			<app-shell-client />
		</div>

		<app-shell-hot-bottom>
			<app-minbar v-show="!visibleRightPane" />
			<app-client-status-bar v-if="GJ_IS_CLIENT" key="shell-client-status-bar" />
		</app-shell-hot-bottom>
	</div>
</template>
