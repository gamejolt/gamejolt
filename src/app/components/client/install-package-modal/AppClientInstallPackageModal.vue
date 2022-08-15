<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import { arrayIndexBy } from '../../../../utils/array';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import { getDeviceArch, getDeviceOS } from '../../../../_common/device/device.service';
import { GameBuild } from '../../../../_common/game/build/build.model';
import { Game } from '../../../../_common/game/game.model';
import AppGamePackageCard from '../../../../_common/game/package/card/card.vue';
import { GamePackagePayloadModel } from '../../../../_common/game/package/package-payload.model';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import AppModal from '../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';

const props = defineProps({
	game: {
		type: Object as PropType<Game>,
		required: true,
	},
});

const { game } = toRefs(props);
const modal = useModal()!;

const isLoading = ref(true);
const packageData = ref<GamePackagePayloadModel>();

const buildsByPackage = computed((): { [packageId: number]: GameBuild } => {
	const builds = packageData.value?.installableBuilds;
	if (!builds) {
		return {};
	}

	return arrayIndexBy(builds, 'game_package_id');
});

const installablePackages = computed(() => {
	const packagesById = arrayIndexBy(packageData.value?.packages ?? [], 'id');
	return Object.keys(buildsByPackage.value)
		.map(pkgId => packagesById[pkgId])
		.filter(pkg => !!pkg);

	// Can probably also just do this, but the above seems more resillient.
	// I don't want to assume installableBuilds is always necessarily computed from this.packageData.packages
	// return this.packageData.packages.filter(p => !!this.buildsByPackage[p.id]);
});

async function init() {
	const payload = await Api.sendRequest(`/web/discover/games/packages/${game.value.id}`);
	packageData.value = new GamePackagePayloadModel(payload);

	const os = getDeviceOS();
	const arch = getDeviceArch();
	packageData.value.installableBuilds = Game.pluckInstallableBuilds(
		packageData.value.packages,
		os!,
		arch
	);

	isLoading.value = false;
}

init();
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<AppJolticon icon="download-box" big />
				<AppTranslate>Choose a Package</AppTranslate>
			</h2>
		</div>

		<div class="modal-body">
			<p>
				<AppTranslate>
					This game has multiple installable packages. Please choose the one you'd like to
					install.
				</AppTranslate>
			</p>

			<AppLoading v-if="isLoading" big />
			<template v-else-if="installablePackages.length">
				<AppGamePackageCard
					v-for="pkg of installablePackages"
					:key="pkg.id"
					:game="game"
					:sellable="pkg._sellable"
					:package="pkg"
					:releases="pkg._releases"
					:builds="pkg._builds"
				/>
			</template>
			<div v-else class="alert alert-notice">
				<AppTranslate>This game doesn't have any packages to install.</AppTranslate>
			</div>
		</div>
	</AppModal>
</template>
