<script lang="ts" setup>
import { PropType } from 'vue';
import { formatFilesize } from '../../../filters/filesize';
import AppJolticon from '../../../jolticon/AppJolticon.vue';
import AppTranslate from '../../../translate/AppTranslate.vue';
import { GameBuild, GameBuildEmulatorInfo } from '../../build/build.model';
import { GamePackageCardModel } from './card.model';

defineProps({
	card: {
		type: Object as PropType<GamePackageCardModel>,
		required: true,
	},
});

const emit = defineEmits({
	click: (_build: GameBuild) => true,
});

function click(build: GameBuild) {
	emit('click', build);
}
</script>

<template>
	<div class="list-group list-group-dark nowrap">
		<a
			v-for="extraBuild of card.extraBuilds"
			:key="`${extraBuild.icon}-${extraBuild.build.id}`"
			v-app-track-event="`game-package-card:more-options:click-option`"
			class="list-group-item has-icon"
			@click="click(extraBuild.build)"
		>
			<AppJolticon :icon="extraBuild.icon" />

			<!-- We show the filename if it's an "Other" build. -->
			<template v-if="!extraBuild.build.os_other">
				<AppTranslate v-if="extraBuild.build.type === 'downloadable'">
					Download
				</AppTranslate>
				<AppTranslate
					v-else-if="extraBuild.build.type === 'rom'"
					:translate-params="{
						platform: GameBuildEmulatorInfo[extraBuild.build.emulator_type],
					}"
					translate-comment="%{ platform } will be the platform we are downloading for, such as Game Boy, NES, etc."
				>
					Download %{ platform } ROM
				</AppTranslate>
				<AppTranslate v-else> Play </AppTranslate>
			</template>
			<template v-else>
				{{ extraBuild.build.primary_file.filename }}
			</template>

			<small v-if="extraBuild.arch === '64'">
				<AppTranslate>64-bit</AppTranslate>
			</small>

			<small class="text-muted">
				({{ formatFilesize(extraBuild.build.primary_file.filesize) }})
			</small>

			<!-- If the version is different than the main release, then show it. -->
			<span
				v-if="extraBuild.build.game_release_id !== card.showcasedRelease?.id"
				class="tiny"
			>
				<em>v{{ extraBuild.build._release!.version_number }}</em>
			</span>

			<small v-if="GJ_IS_DESKTOP_APP && extraBuild.type !== 'html'" class="text-muted">
				<br />
				<em>
					<AppTranslate>(will open in browser)</AppTranslate>
				</em>
			</small>
		</a>
	</div>
</template>
