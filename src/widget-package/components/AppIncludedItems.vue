<script lang="ts" setup>
import { computed } from 'vue';
import { formatFilesize } from '../../_common/filters/filesize';
import { GameBuildModel } from '../../_common/game/build/build.model';
import { vAppTooltip } from '../../_common/tooltip/tooltip-directive';
import { useWidgetPackageStore } from '../store/index';

const store = useWidgetPackageStore();

const gamePackage = computed(() => store.gamePackage.value!);
const packagePayload = computed(() => store.packagePayload.value!);
const packageCard = computed(() => store.packageCard.value!);

function hasSupport(build: GameBuildModel, os: string) {
	return _checkBuildSupport(build, os) || _checkBuildSupport(build, os + '_64');
}

function is64BitOnly(build: GameBuildModel, os: string) {
	return !_checkBuildSupport(build, os) && _checkBuildSupport(build, os + '_64');
}

function _checkBuildSupport(build: GameBuildModel, os: string) {
	return (build as any)['os_' + os] ?? false;
}
</script>

<template>
	<div class="-included-items">
		<div class="row">
			<div class="col-xs-6 col-centered">
				<p v-if="gamePackage.description">
					{{ gamePackage.description }}
				</p>

				<ul>
					<li v-for="build of packagePayload.builds" :key="build.id">
						{{ build.primary_file.filename }}
						<small class="text-muted">
							({{ formatFilesize(build.primary_file.filesize) }})
						</small>

						<span
							v-for="os of ['windows', 'mac', 'linux', 'other']"
							:key="os"
							v-app-tooltip.touchable="packageCard.platformSupportInfo[os].tooltip"
						>
							<template v-if="hasSupport(build, os)">
								{{ packageCard.platformSupportInfo[os].tooltip }}
							</template>

							<template v-if="is64BitOnly(build, os)">64-bit</template>
						</span>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-included-items
	p
	ul
		margin-bottom: $shell-padding

		&:last-child
			margin-bottom: 0

	ul
		padding-left: 0
		list-style: none

	li
		margin-bottom: 5px
</style>
