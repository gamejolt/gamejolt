import { arrayUnique } from '../../../../utils/array';
import { getDeviceArch, getDeviceOS } from '../../../device/device.service';
import { Jolticon } from '../../../jolticon/AppJolticon.vue';
import { LinkedKeyModel } from '../../../linked-key/linked-key.model';
import { SellableModel } from '../../../sellable/sellable.model';
import {
	GameBuildPlatformSupportInfo,
	GameBuildType,
	canInstallGameBuild,
	canRunGameBuild,
	type GameBuildModel,
} from '../../build/build.model';
import { GameReleaseModel } from '../../release/release.model';

interface ExtraBuild {
	type: string;
	icon: Jolticon;
	build: GameBuildModel;
	platform: string;
	arch: string | null;
}

/**
 * A model that contains information that is used to render and interact with game package cards.
 */
export class GamePackageCardModel {
	platformSupportInfo = Object.assign({}, GameBuildPlatformSupportInfo);
	platformSupport: string[] = [];
	/**
	 * The "most suitable" build that is playable on the current device after
	 * downloading it (e.g. not a browser build).
	 */
	downloadableBuild: GameBuildModel | null = null;
	/**
	 * The "most suitable" build that is runnable on the current device.
	 */
	runnableBuild: GameBuildModel | null = null;
	/**
	 * The "most suitable" build that is installable on the current device using
	 * the GJ desktop app. A build is installable if it is a runnable build
	 * and is not marked as an installer.
	 */
	installableBuild: GameBuildModel | null = null;
	browserBuild: GameBuildModel | null = null;
	/**
	 * All of the package's builds, sorted by how much they are "suitable" for
	 * the current device, excluding the "most suitable" one.
	 *
	 * TODO(game-build-installers) since most suitable is contextual, we might
	 * need different extraBuilds depending on the conetxt as well..
	 */
	extraBuilds: ExtraBuild[] = [];
	showcasedRelease: GameReleaseModel | null = null;
	showcasedOs = '';
	showcasedOsIcon = '';
	showcasedBrowserIcon = '';
	otherOnly = false;
	linkedKeys: LinkedKeyModel[] = [];

	get hasSteamKey() {
		return this.platformSupport.indexOf('steam') !== -1;
	}

	constructor(
		sellable: SellableModel,
		releases: GameReleaseModel[],
		builds: GameBuildModel[],
		linkedKeys?: LinkedKeyModel[]
	) {
		if (builds) {
			const os = getDeviceOS();
			const arch = getDeviceArch();

			// Indexes by the os/type of the build: [ { type: build } ]
			// While looping we also gather all OS/browser support for this complete package.
			const indexedBuilds: { [k: string]: GameBuildModel } = {};
			const otherBuilds: GameBuildModel[] = [];
			builds.forEach(build => {
				// Browser based builds can be played on the browser.
				if (build.isBrowserBased) {
					indexedBuilds[build.type] = build;
					this.platformSupport.push(build.type);
				}
				// ROMs are special cases as they can be treated as
				// downloadables or emulated on the browser.
				else if (build.type === GameBuildType.Rom) {
					indexedBuilds[build.type] = build;
					this.platformSupport.push(build.type);
					// Adding them to other builds lets them show as downloadables.
					otherBuilds.push(build);
				}
				// "other" builds are any non windows/mac/linux. Note: this
				// includes mobile builds since they are always marked as
				// "other".
				else if (build.os_other) {
					// TODO(game-build-installers) im iffy on this. This means
					// that a build that bundles a win/mac/linux version AND any
					// other build will be treated as "other" exclusively?
					otherBuilds.push(build);
				}
				// The rest are windows/mac/linux. Note: 32bit builds can
				// (usually) run on 64bit devices, but we don't want to mark a
				// 32bit build as a 64bit one. In cases where a build is marked
				// as both 32bit and 64bit we treat it as a universal build and
				// mark it as 32bit only. This lets us reserve the 64bit spot to
				// a build that IS exclusively 64bit.
				else {
					pluckGameBuildOsSupport(build).forEach(platform => {
						indexedBuilds[platform] = build;
						this.platformSupport.push(this.platformSupportInfo[platform].icon);
					});
				}
			});

			for (const provider of sellable.linked_key_providers) {
				this.platformSupport.push(provider);
			}

			this.platformSupport = arrayUnique(this.platformSupport);

			// At this point we should have all the OS/browser support, so let's sort it.
			// The sort values are defined above, but we want to push their detected OS at
			// the front. This is because you'd probably want to see [linux] first if you're
			// on a linux machine, before windows, etc.
			// We change the sort for their detected OS to be the first before sorting.
			if (this.platformSupportInfo[os]) {
				this.platformSupportInfo[os].sort = 0;
			}

			this.platformSupport.sort((a, b) => {
				return this.platformSupportInfo[a].sort - this.platformSupportInfo[b].sort;
			});

			// Now that we have all the builds indexed by the platform they support
			// we need to try to pick one to showcase as the default. We put
			// their detected OS first so that it tries to pick that one first.
			const checkDownloadables = [
				'windows',
				'windows_64',
				'mac',
				'mac_64',
				'linux',
				'linux_64',
			];

			// This will put the 64 bit version as higher priority.
			if (arch === '64') {
				checkDownloadables.unshift(os);
				checkDownloadables.unshift(os + '_64');
			} else {
				// If we don't have a detected arch that is 64, we prioritize the universal version.
				checkDownloadables.unshift(os + '_64');
				checkDownloadables.unshift(os);
			}

			// TODO(game-build-installers) This picks the preferable
			// downloadable build but it doesnt take into consideration if that
			// build is installable. Some parts of the code need
			// downloadableBuild for actually downloading it and some for
			// installing it. For the latter, we want to fall back to the other
			// build if its installable and the "preferred" one is not. This
			// means we probably want a different field for when we want a build
			// for installing... Need to go through everything that uses
			// downloadableBuild and see if it needs to change.
			for (const platform of checkDownloadables) {
				if (!indexedBuilds[platform]) {
					continue;
				}

				const build = indexedBuilds[platform];

				// The first build is always downloadable, even if it isnt
				// guaranteed to run on the current device.
				if (!this.downloadableBuild) {
					this.downloadableBuild = build;
					// TODO(game-build-installers) we might want to save showcasedOs/Icon for runnableBuild and installableBuild too to display the correct thing depending on context.
					this.showcasedOs = platform;
					this.showcasedOsIcon = this.platformSupportInfo[platform].icon;
				}

				if (!this.runnableBuild && canRunGameBuild({ build, os, arch })) {
					this.runnableBuild = build;
				}

				if (!this.installableBuild && canInstallGameBuild({ build, os, arch })) {
					this.installableBuild = build;
				}

				// If we found both, can stop looping.
				if (this.downloadableBuild && this.installableBuild) {
					break;
				}
			}

			// Do the same with browser type. Pick the default browser one to
			// show. We include ROMs in browser play.
			['html', 'flash', 'unity', 'applet', 'silverlight', 'rom'].every(type => {
				if (!indexedBuilds[type]) {
					return true;
				}

				this.browserBuild = indexedBuilds[type];
				this.showcasedBrowserIcon = this.platformSupportInfo[type].icon;
				return false;
			});

			// TODO(game-build-installers) do we want the showcased release to
			// be based off of the installable build, runnable build or
			// downloadable build?
			const localBuild = GJ_IS_DESKTOP_APP
				? this.installableBuild ?? this.runnableBuild ?? this.downloadableBuild
				: this.downloadableBuild;

			// Pull the showcased release version.
			// It should be the greater one for either the local or browser build chosen.
			if (localBuild) {
				this.showcasedRelease = localBuild._release || null;
			}

			// Lower sort value is a "newer" version.
			if (
				this.browserBuild &&
				(!this.showcasedRelease ||
					this.browserBuild._release!.sort < this.showcasedRelease.sort)
			) {
				this.showcasedRelease = this.browserBuild._release || null;
			}

			const addExtraBuild = (build: GameBuildModel, type: string) => {
				// Whether or not we stored this build in extra builds yet.
				let alreadyAdded = false;
				this.extraBuilds.forEach(extraBuild => {
					if (extraBuild.build.id === build.id) {
						alreadyAdded = true;
					}
				});

				if (alreadyAdded) {
					return;
				}

				this.extraBuilds.push({
					type: build.type,
					icon: this.platformSupportInfo[type].icon,
					build: build,
					arch: this.platformSupportInfo[type].arch || null,
					platform: type,
				});
			};

			// Now pull the extra builds (ones that aren't default).
			Object.keys(indexedBuilds).forEach(type => {
				const build = indexedBuilds[type];

				if (build === localBuild && type === this.showcasedOs) {
					return;
				}

				if (build.type !== GameBuildType.Downloadable) {
					if (this.browserBuild && this.browserBuild.id === build.id) {
						return;
					}
				}

				addExtraBuild(build, type);
			});

			// Add all the "Other" builds onto the end of extra.
			if (otherBuilds.length) {
				otherBuilds.forEach(build => {
					let supportKey = 'other';
					if (build.type === GameBuildType.Rom) {
						supportKey = 'rom';
					}

					addExtraBuild(build, supportKey);
				});
			}

			// Sort extra builds if there are any.
			if (this.extraBuilds.length) {
				this.extraBuilds.sort((a, b) => {
					return (
						this.platformSupportInfo[a.platform].sort -
						this.platformSupportInfo[b.platform].sort
					);
				});
			}

			if (!localBuild && !this.browserBuild && otherBuilds.length) {
				this.otherOnly = true;
				this.showcasedRelease = releases[0];
			}
		}

		if (linkedKeys) {
			for (const linkedKey of linkedKeys) {
				this.linkedKeys.push(linkedKey);
			}
		}
	}
}

function pluckGameBuildOsSupport(build: GameBuildModel) {
	const support = [];

	// We only include the 64-bit versions if the build doesn't have 32bit and 64bit
	// on the same build. That basically just means it's a universal build.

	if (build.os_windows) {
		support.push('windows');
	}

	if (build.os_windows_64 && !build.os_windows) {
		support.push('windows_64');
	}

	if (build.os_mac) {
		support.push('mac');
	}

	if (build.os_mac_64 && !build.os_mac) {
		support.push('mac_64');
	}

	if (build.os_linux) {
		support.push('linux');
	}

	if (build.os_linux_64 && !build.os_linux) {
		support.push('linux_64');
	}

	if (build.os_other) {
		support.push('other');
	}

	return support;
}
