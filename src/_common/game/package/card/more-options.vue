<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { formatFilesize } from '../../../filters/filesize';
import { GameBuild } from '../../build/build.model';
import { GamePackageCardModel } from './card.model';

@Options({})
export default class AppGamePackageCardMoreOptions extends Vue {
	@Prop(Object) card!: GamePackageCardModel;

	readonly emulatorInfo = GameBuild.emulatorInfo;
	readonly formatFilesize = formatFilesize;

	@Emit('click')
	emitClick(_build: GameBuild) {}

	click(build: GameBuild) {
		this.emitClick(build);
	}
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
			<app-jolticon :icon="extraBuild.icon" />

			<!-- We show the filename if it's an "Other" build. -->
			<template v-if="!extraBuild.build.os_other">
				<translate v-if="extraBuild.build.type === 'downloadable'"> Download </translate>
				<translate
					v-else-if="extraBuild.build.type === 'rom'"
					:translate-params="{ platform: emulatorInfo[extraBuild.build.emulator_type] }"
					translate-comment="%{ platform } will be the platform we are downloading for, such as Game Boy, NES, etc."
				>
					Download %{ platform } ROM
				</translate>
				<translate v-else> Play </translate>
			</template>
			<template v-else>
				{{ extraBuild.build.primary_file.filename }}
			</template>

			<small v-if="extraBuild.arch === '64'">
				<translate>64-bit</translate>
			</small>

			<small class="text-muted">
				({{ formatFilesize(extraBuild.build.primary_file.filesize) }})
			</small>

			<!-- If the version is different than the main release, then show it. -->
			<span v-if="extraBuild.build.game_release_id !== card.showcasedRelease.id" class="tiny">
				<em>v{{ extraBuild.build._release.version_number }}</em>
			</span>

			<small v-if="GJ_IS_DESKTOP_APP && extraBuild.type !== 'html'" class="text-muted">
				<br />
				<em>
					<translate>(will open in browser)</translate>
				</em>
			</small>
		</a>
	</div>
</template>
