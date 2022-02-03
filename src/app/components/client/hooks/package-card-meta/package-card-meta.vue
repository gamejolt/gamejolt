<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../../../utils/vue';
import { Game } from '../../../../../_common/game/game.model';
import { GamePackageCardModel } from '../../../../../_common/game/package/card/card.model';
import { GamePackage } from '../../../../../_common/game/package/package.model';
import { useClientLibraryStore } from '../../../../store/client-library/index';
import { LocalDbPackage } from '../../local-db/package/package.model';

@Options({})
export default class AppClientPackageCardMeta extends Vue {
	readonly clientLibrary = shallowSetup(() => useClientLibraryStore());

	@Prop(Object) game!: Game;
	@Prop(Object) package!: GamePackage;
	@Prop(Object) card!: GamePackageCardModel;

	get localPackage(): LocalDbPackage | undefined {
		return this.clientLibrary.packagesById.value[this.package.id];
	}
}
</script>

<template>
	<span class="client-package-card-meta" v-if="localPackage">
		<template v-if="localPackage.isInstalling">
			<template v-if="!localPackage.isPatchPaused">
				<AppTranslate class="tag tag-highlight text-upper" v-if="localPackage.isInstalling">
					Installing
				</AppTranslate>
				<AppTranslate
					class="tag tag-notice text-upper"
					v-else-if="localPackage.didInstallFail"
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
				<AppTranslate class="tag tag-highlight text-upper" v-if="localPackage.isUpdating">
					Updating
				</AppTranslate>
				<AppTranslate
					class="tag tag-notice text-upper"
					v-else-if="localPackage.didUpdateFail"
				>
					Update Failed
				</AppTranslate>
			</template>
			<template v-else>
				<AppTranslate class="tag text-upper">Update Paused</AppTranslate>
			</template>
		</template>
		<template v-else-if="localPackage.isSettled">
			<AppTranslate class="tag text-upper" v-if="!localPackage.isRunning"
				>Installed</AppTranslate
			>
			<AppTranslate class="tag tag-highlight text-upper" v-else>Running</AppTranslate>
		</template>
		<AppTranslate class="tag text-upper" v-else-if="localPackage.isRemoving"
			>Removing</AppTranslate
		>
		<AppTranslate class="tag tag-notice text-upper" v-else>Failed</AppTranslate>

		<span class="dot-separator"></span>
	</span>
</template>
