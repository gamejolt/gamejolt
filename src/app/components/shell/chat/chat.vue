<template>
	<div>
		<app-shortkey shortkey="c" @press="showChatPane" />

		<app-scroll-scroller
			id="shell-chat-pane"
			class="shell-pane shell-pane-right"
			:class="{ visible: isRightPaneVisible }"
			thin
		>
			<app-chat-sidebar v-if="isRightPaneVisible" />
		</app-scroll-scroller>
		<app-chat-windows />
	</div>
</template>

<script lang="ts" src="./chat"></script>
