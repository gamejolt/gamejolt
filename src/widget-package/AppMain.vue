<script lang="ts" setup>
import { onMounted } from '@vue/runtime-core';
import AppJolticon from '../_common/jolticon/AppJolticon.vue';
import { AppTheme } from '../_common/theme/theme';
import { useThemeStore } from '../_common/theme/theme.store';
import AppFooter from './components/footer/footer.vue';
import AppGameHeader from './components/game-header/game-header.vue';
import AppProcessingOverlay from './components/processing-overlay/processing-overlay.vue';
import AppToast from './components/toast/toast.vue';
import { useWidgetPackageStore } from './store/index';

const WidgetThemeKey = 'widget';

const {
	bootstrap,
	isLightTheme,
	isLoaded,
	isProcessing,
	hasInvalidKey,
	hasFailure,
	view,
	sellableKey,
	game,
} = useWidgetPackageStore();
const { setPageTheme } = useThemeStore();

onMounted(async () => {
	if (!sellableKey.value) {
		hasInvalidKey.value = true;
		return;
	}

	await bootstrap();
	if (game.value) {
		setPageTheme({
			key: WidgetThemeKey,
			theme: game.value.theme ?? null,
		});
	}
});

function dismissError() {
	hasFailure.value = undefined;
}
</script>

<template>
	<div
		class="shell"
		:class="{
			'theme-dark fill-darker': !isLightTheme,
			'theme-light': isLightTheme,
			'is-loaded': isLoaded,
			'has-invalid-key-error': hasInvalidKey,
		}"
	>
		<AppTheme />

		<div v-if="hasInvalidKey" class="alert alert-notice text-center">
			<AppJolticon icon="notice" />
			Invalid widget key.
		</div>

		<!-- TODO(vue3): will this transition flow through all the levels of components to trigger the animation? -->
		<transition>
			<AppProcessingOverlay v-if="isProcessing" />
		</transition>

		<transition name="slide-up">
			<AppToast v-if="hasFailure === 'setup-order'" type="error" @dismiss="dismissError()">
				Something went wrong!
			</AppToast>
		</transition>

		<div v-if="isLoaded">
			<AppGameHeader />
			<component :is="view" />
		</div>

		<AppFooter />
	</div>
</template>

<style lang="stylus" scoped>
.shell
	rounded-corners()
	padding: $shell-padding
	position: relative
	height: $shell-height - $pricing-card-offset

.theme-light
	theme-prop('background-color', 'bg-offset')
</style>
