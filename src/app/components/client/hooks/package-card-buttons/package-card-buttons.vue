<template>
	<div class="package-card-buttons">
		<!-- Messaging for weird cases... -->
		<div class="alert" v-if="downloadableUnsupported">
			<p>
				<app-jolticon icon="notice" notice />
				<translate>This package can not be installed on your system.</translate>
			</p>
		</div>

		<div class="alert" v-if="downloadableUnsupportedHasQuickPlay">
			<p>
				<app-jolticon icon="notice" notice />
				<translate>
					This package can not be installed on your system, but can be quick played in the client.
				</translate>
			</p>
		</div>

		<template v-if="localPackage">
			<div
				class="alert alert-notice"
				v-if="localPackage.install_state === PatchState.DOWNLOAD_FAILED"
			>
				<p>
					<app-jolticon icon="notice" />
					<translate>
						Oh no! We couldn't download this package. Perhaps check that you're still online?
					</translate>
				</p>
			</div>

			<div
				class="alert alert-notice"
				v-if="localPackage.install_state === PatchState.UNPACK_FAILED"
			>
				<p>
					<app-jolticon icon="notice" />
					<translate>
						Oh no! We couldn't unpack this package after downloading it. Maybe try again?
					</translate>
				</p>
			</div>

			<div
				class="alert alert-notice"
				v-if="localPackage.remove_state === RemoveState.REMOVE_FAILED"
			>
				<p>
					<app-jolticon icon="notice" />
					<translate>Oh no! We couldn't remove this package. Maybe try again?</translate>
				</p>
			</div>

			<div class="alert alert-highlight" v-if="localPackage.isRunning">
				<p>
					<app-jolticon icon="play" />
					<translate>
						You are currently running this package. Some options have been disabled while it's open.
					</translate>
				</p>
			</div>
		</template>

		<!-- Able to install game -->
		<app-button
			v-if="canInstall && !localPackage"
			primary
			icon="download-box"
			@click="installClick(card.downloadableBuild)"
		>
			<translate>Install</translate>
			<small>({{ card.downloadableBuild.primary_file.filesize | filesize }})</small>
		</app-button>

		<!-- Game is installing or installed -->
		<template v-if="localPackage">
			<template v-if="localPackage.isPatching">
				<app-expand :when="localPackage.isDownloading || localPackage.isUnpacking">
					<div class="alert">
						<app-client-install-progress :local-package="localPackage" />
					</div>
				</app-expand>

				<template v-if="localPackage.isPatchQueued">
					<span class="tag big">
						<translate>QUEUED</translate>
					</span>
				</template>
				<template v-else>
					<app-button v-if="!localPackage.isPatchPaused" @click="pauseInstall()">
						<translate>Pause</translate>
					</app-button>
					<app-button v-else primary @click="resumeInstall()">
						<translate>Resume</translate>
					</app-button>
				</template>
			</template>

			<!-- Game failed to install -->
			<app-button v-if="localPackage.didInstallFail" primary @click="retryInstall()">
				<translate>Retry Install</translate>
			</app-button>

			<!-- Game failed to update -->
			<app-button v-if="localPackage.didUpdateFail" primary @click="retryInstall()">
				<translate>Retry Update</translate>
			</app-button>

			<!-- Game failed to uninstall -->
			<app-button v-if="localPackage.didRemoveFail" primary @click="retryUninstall()">
				<translate>Retry Uninstall</translate>
			</app-button>

			<!--
			Can only cancel installs, not updates.
		-->
			<app-button
				v-if="localPackage.install_state"
				circle
				icon="remove"
				:trans="!overlay"
				@click="cancelInstall()"
				v-app-tooltip="$gettext('Cancel Installation')"
			/>

			<!-- Game is installed -->
			<app-button
				v-if="localPackage.isSettled && !localPackage.isRunning"
				primary
				solid
				icon="play"
				@click="launchPackage()"
			>
				<translate>Launch</translate>
			</app-button>
		</template>

		<!--
		Browser quick play
		We hide this as soon as they install the game.
	-->
		<app-button
			v-else-if="card.browserBuild"
			primary
			icon="play"
			@click="buildClick(card.browserBuild)"
		>
			<translate>Quick Play</translate>
			<app-jolticon icon="addon" :class="`jolticon-${card.showcasedBrowserIcon}`" />
		</app-button>

		<app-popper v-if="card.extraBuilds.length || (localPackage && !localPackage.install_state)">
			<app-button
				circle
				icon="ellipsis-v"
				:trans="!overlay"
				v-app-track-event="`game-package-card:more-options`"
			/>

			<div slot="popover">
				<div
					v-if="localPackage && (card.browserBuild || localPackage.isSettled)"
					class="more-client-options list-group list-group-dark nowrap"
				>
					<template v-if="localPackage.isSettled">
						<a class="list-group-item has-icon" @click="openFolder()">
							<app-jolticon icon="folder-open" />
							<span v-translate="{ title: localPackage.title || game.title }">
								Open Folder for %{ title }
							</span>
						</a>

						<!--
						In client, if a package is installed, allow them to remove.
					-->
						<a
							@click="uninstall()"
							:class="{ disabled: localPackage.isRunning }"
							class="list-group-item has-icon warning"
						>
							<app-jolticon icon="remove" notice />
							<translate>Uninstall</translate>
						</a>
					</template>

					<!--
					If this game has a quick play web build but is installed, we want
					to show the quick play here now.
				-->
					<template v-else-if="card.browserBuild">
						<a @click="buildClick(card.browserBuild)" class="list-group-item has-icon warning">
							<app-jolticon icon="html5" />
							<translate>Quick Play</translate>
							<small class="text-muted">
								({{ card.browserBuild.primary_file.filesize | filesize }})
							</small>
						</a>
					</template>
				</div>

				<!--
				The non-client options.
			-->
				<app-game-package-card-more-options :card="card" @click="buildClick($event, true)" />
			</div>
		</app-popper>
	</div>
</template>

<style lang="stylus" scoped>
.more-client-options
	margin-bottom: 0
</style>

<script lang="ts" src="./package-card-buttons"></script>
