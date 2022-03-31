<script lang="ts">
type MenuBuilderHook = (menu: nw.Menu) => void;
let menuBuilderHook: MenuBuilderHook | undefined;

export function setMenuBuilderHook(newHook: MenuBuilderHook) {
	menuBuilderHook = newHook;
}
</script>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, Ref, ref } from 'vue';
import { Navigate } from '../../navigate/navigate.service';
import { Screen } from '../../screen/screen-service';
import { $gettext } from '../../translate/translate.service';
import { Client } from '../client.service';

const path = require('path') as typeof import('path');

const isFocused = ref(false);
const isMinimized = ref(false);
const isClosed = ref(false);

const tray = ref(null) as Ref<nw.Tray | null>;

const isClientGreedy = computed(() => Navigate.currentClientSection === 'app');

onMounted(() => {
	registerWindowEvents();
	createTray();
});

onUnmounted(() => {
	removeTray();
});

function registerWindowEvents() {
	const win = nw.Window.get();

	win.on('blur', () => (isFocused.value = false));
	win.on('focus', () => (isFocused.value = true));
	win.on('minimize', () => {
		isMinimized.value = true;
	});
	win.on('restore', () => {
		isMinimized.value = false;
	});

	win.on('close', () => {
		// If we should just minimize to tray instead of quitting.
		if (isClientGreedy.value) {
			isClosed.value = true;
			isMinimized.value = false;
			Client.hide();
		} else {
			// Otherwise actually quit.
			Client.quit();
		}
	});
}

function createTray() {
	if (tray.value || Navigate.isRedirecting) {
		return;
	}

	console.log(Client.nwStaticAssetsDir);
	console.log('tray icons');

	tray.value = new nw.Tray({
		title: 'Game Jolt Client',
		icon: path.resolve(
			Client.nwStaticAssetsDir,
			`client-tray-icon${Screen.isHiDpi ? '-2x' : ''}.png`
		),
	});

	Navigate.registerDestructor(() => {
		removeTray();
	});

	tray.value.on('click', () => toggleVisibility());

	const menu = new nw.Menu();

	if (menuBuilderHook) {
		menuBuilderHook(menu);
	}

	const quitItem = new nw.MenuItem({
		label: $gettext('Quit'),
	});

	quitItem.on('click', () => Client.quit());

	menu.append(quitItem);

	tray.value.menu = menu;
}

function removeTray() {
	if (!tray.value) {
		return;
	}

	tray.value.remove();
	tray.value = null;
}

function toggleVisibility() {
	const win = nw.Window.get();

	if (isClosed.value || isMinimized.value || !isFocused.value) {
		console.log('toggleVisibility');
		Client.show();
		isClosed.value = false;
	} else {
		// If the window is being shown and is focused, let's minimize it.
		win.minimize();
	}
}
</script>

<template>
	<div />
</template>
