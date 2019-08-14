<template>
	<div class="game-package-card-app-buttons">
		<app-button primary v-if="card.browserBuild" @click="click(card.browserBuild)">
			<translate>Play</translate>
			<app-jolticon class="jolticon-addon" :icon="card.showcasedBrowserIcon" />
		</app-button>

		<app-button
			:primary="!card.browserBuild"
			v-if="card.downloadableBuild"
			@click="click(card.downloadableBuild)"
		>
			<translate>Download</translate>
			<small v-if="card.platformSupportInfo[card.showcasedOs].arch == '64'">
				<translate>64-bit</translate>
			</small>
			<small class="hidden-xs">
				({{ card.downloadableBuild.primary_file.filesize | filesize }})
			</small>
			<app-jolticon class="jolticon-addon" :icon="card.showcasedOsIcon" />
		</app-button>

		<!--
		If this package only has "Other" builds, then we make it look like a download button with a
		[...] after. If the package has normal builds too, then we just show it as a more options
		sparse button.
	-->
		<app-popper v-if="card.extraBuilds.length">
			<app-button
				icon="ellipsis-v"
				:primary="card.otherOnly"
				:circle="!card.otherOnly"
				:trans="!card.otherOnly"
				v-app-track-event="`game-package-card:more-options`"
			>
				<template v-if="card.otherOnly">
					<translate>Download</translate>
					<app-jolticon class="jolticon-addon" icon="other-os" />
				</template>
			</app-button>

			<app-game-package-card-more-options
				slot="popover"
				:card="card"
				@click="click($event, true)"
			/>
		</app-popper>
	</div>
</template>

<script lang="ts" src="./buttons"></script>
