<template>
	<div class="list-group list-group-dark nowrap">
		<a
			class="list-group-item has-icon"
			v-for="extraBuild of card.extraBuilds"
			:key="`${extraBuild.icon}-${extraBuild.build.id}`"
			v-app-track-event="`game-package-card:more-options:click-option`"
			@click="click(extraBuild.build)"
		>
			<app-jolticon :icon="extraBuild.icon" />

			<!--
			We show the filename if it's an "Other" build.
		-->
			<template v-if="!extraBuild.build.os_other">
				<translate v-if="extraBuild.build.type === 'downloadable'">
					Download
				</translate>
				<translate
					v-else-if="extraBuild.build.type === 'rom'"
					:translate-params="{ platform: emulatorInfo[extraBuild.build.emulator_type] }"
					translate-comment="%{ platform } will be the platform we are downloading for, such as Game Boy, NES, etc."
				>
					Download %{ platform } ROM
				</translate>
				<translate v-else>
					Play
				</translate>
			</template>
			<template v-else>
				{{ extraBuild.build.primary_file.filename }}
			</template>

			<small v-if="extraBuild.arch === '64'">
				<translate>64-bit</translate>
			</small>

			<small class="text-muted">({{ extraBuild.build.primary_file.filesize | filesize }})</small>

			<!--
			If the version is different than the main release, then show it.
		-->
			<span class="tiny" v-if="extraBuild.build.game_release_id !== card.showcasedRelease.id">
				<em>v{{ extraBuild.build._release.version_number }}</em>
			</span>

			<small class="text-muted" v-if="GJ_IS_CLIENT && extraBuild.type !== 'html'">
				<br />
				<em>
					<translate>(will open in browser)</translate>
				</em>
			</small>
		</a>
	</div>
</template>

<script lang="ts" src="./more-options"></script>
