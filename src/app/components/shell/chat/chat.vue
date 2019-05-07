<template>
	<div>
		<app-shortkey shortkey="c" @pressed="showChatPane" />

		<app-scroll-inview-parent
			id="shell-chat-pane"
			class="shell-pane shell-pane-right scrollable"
			:class="{ visible: isRightPaneVisible }"
			:throttle="0"
		>
			<app-chat-sidebar v-if="isRightPaneVisible" />
		</app-scroll-inview-parent>
		<app-chat-windows />
	</div>
</template>

<script lang="ts" src="./chat"></script>
