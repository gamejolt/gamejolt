<script lang="ts" setup>
import { onMounted } from 'vue';
import AppJolticon from '../_common/jolticon/AppJolticon.vue';
import { SellableType } from '../_common/sellable/sellable.model';
import AppTheme from '../_common/theme/AppTheme.vue';
import { useThemeStore } from '../_common/theme/theme.store';
import AppTooltipPortal from '../_common/tooltip/AppTooltipPortal.vue';
import AppDownload from './components/AppDownload.vue';
import AppFooter from './components/AppFooter.vue';
import AppGameHeader from './components/AppGameHeader.vue';
import AppProcessingOverlay from './components/AppProcessingOverlay.vue';
import AppToast from './components/AppToast.vue';
import FormPayment from './components/forms/FormPayment.vue';
import { useWidgetPackageStore } from './store/index';

const WidgetThemeKey = 'widget';

const {
	bootstrap,
	isLightTheme,
	isLoaded,
	isProcessing,
	hasInvalidKey,
	hasFailure,
	sellable,
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
		class="shell fill-offset"
		:class="{
			'is-loaded': isLoaded,
			'has-invalid-key-error': hasInvalidKey,
		}"
	>
		<AppTheme :force-dark="!isLightTheme" :force-light="isLightTheme" is-root>
			<AppTooltipPortal />

			<div v-if="hasInvalidKey" class="alert alert-notice text-center">
				<AppJolticon icon="notice" />
				Invalid widget key.
			</div>

			<transition>
				<AppProcessingOverlay v-if="isProcessing" />
			</transition>

			<transition name="slide-up">
				<AppToast
					v-if="hasFailure === 'setup-order'"
					type="error"
					@dismiss="dismissError()"
				>
					Something went wrong!
				</AppToast>
			</transition>

			<div v-if="isLoaded">
				<AppGameHeader />
				<FormPayment
					v-if="sellable && sellable.type === SellableType.Paid && !sellable.is_owned"
				/>
				<AppDownload v-else />
			</div>

			<AppFooter />
		</AppTheme>
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
