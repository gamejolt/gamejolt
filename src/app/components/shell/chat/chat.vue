<template>
	<div>
		<app-shortkey shortkey="c" @press="toggleLeftPane('chat')" />

		<app-scroll-scroller
			id="shell-chat-pane"
			class="shell-pane shell-pane-left"
			:class="{ visible: visibleLeftPane === 'chat' }"
			thin
		>
			<app-chat-sidebar v-if="visibleLeftPane === 'chat'" />
		</app-scroll-scroller>
		<app-chat-windows />
	</div>
</template>

<script lang="ts" src="./chat"></script>
