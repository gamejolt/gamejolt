<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { GameModel } from '../../../../_common/game/game.model';
import { GamePackageCardModel } from '../../../../_common/game/package/card/card.model';
import { GamePackageModel } from '../../../../_common/game/package/package.model';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { useClientLibraryStore } from '../../../store/client-library';

const props = defineProps({
	game: {
		type: Object as PropType<GameModel>,
		required: true,
	},
	package: {
		type: Object as PropType<GamePackageModel>,
		required: true,
	},
	card: {
		type: Object as PropType<GamePackageCardModel>,
		required: true,
	},
});

const { packagesById } = useClientLibraryStore();

const localPackage = computed(() => packagesById.value[props.package.id]);
</script>

<template>
	<span v-if="localPackage" class="client-package-card-meta">
		<template v-if="localPackage.isInstalling">
			<template v-if="!localPackage.isPatchPaused">
				<AppTranslate v-if="localPackage.isInstalling" class="tag tag-highlight text-upper">
					Installing
				</AppTranslate>
				<AppTranslate
					v-else-if="localPackage.didInstallFail"
					class="tag tag-notice text-upper"
				>
					Install Failed
				</AppTranslate>
			</template>
			<template v-else>
				<AppTranslate class="tag text-upper">Install Paused</AppTranslate>
			</template>
		</template>
		<template v-else-if="localPackage.isUpdating">
			<template v-if="!localPackage.isPatchPaused">
				<AppTranslate v-if="localPackage.isUpdating" class="tag tag-highlight text-upper">
					Updating
				</AppTranslate>
				<AppTranslate
					v-else-if="localPackage.didUpdateFail"
					class="tag tag-notice text-upper"
				>
					Update Failed
				</AppTranslate>
			</template>
			<template v-else>
				<AppTranslate class="tag text-upper">Update Paused</AppTranslate>
			</template>
		</template>
		<template v-else-if="localPackage.isSettled">
			<AppTranslate v-if="!localPackage.isRunning" class="tag text-upper">
				Installed
			</AppTranslate>
			<AppTranslate v-else class="tag tag-highlight text-upper">Running</AppTranslate>
		</template>
		<AppTranslate v-else-if="localPackage.isRemoving" class="tag text-upper">
			Removing
		</AppTranslate>
		<AppTranslate v-else class="tag tag-notice text-upper">Failed</AppTranslate>

		<span class="dot-separator" />
	</span>
</template>
