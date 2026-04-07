<script lang="ts" setup>
import { onMounted } from 'vue';
import { Client } from '../client.service';

onMounted(() => {
	const win = nw.Window.get();
	const menu = new nw.Menu({ type: 'menubar' });

	menu.createMacBuiltin('Game Jolt Client');

	win.menu = menu;

	win.on('close', (intent: string) => {
		// If we should just minimize instead of quitting.
		// Many applications on mac just minimize instead of actually close.
		if (intent !== 'quit') {
			Client.hide();
		} else {
			Client.quit();
		}
	});

	// reopen is Mac specific
	// When they click the dock, we need to show it in case they hid it with the close.
	nw.App.on('reopen', () => Client.show());
});
</script>

<template>
	<div />
</template>
