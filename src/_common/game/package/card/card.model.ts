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
	sort?: number;
}

/**
 * A model that contains information that is used to render and interact with
 * game package cards.
 *
 * You can do 3 things with a game package card's builds:
 * - Download or install a non browser based build that is compatible with the
 *   current device.
 * - Quick play a build directly in the browser.
 * - Download other builds in the package that are not compatible.
 */
export class GamePackageCardModel {
	platformSupportInfo = Object.assign({}, GameBuildPlatformSupportInfo);
	platformSupport: string[] = [];
	/**
	 * This build is the target of the main action button on the game package
	 * card.
	 *
	 * This is the "most compatible" non browser based build available in the
	 * package. If there is no compatible build it defaults to Windows, then
	 * Mac, then Linux. If there are no downloadable builds at all, this will be
	 * null.
	 */
	primaryBuild: GameBuildModel | null = null;
	/**
	 * The platform of the primary build. This is used to show the icon on the
	 * main action button.
	 */
	primaryPlatform: string | null = null;
	/**
	 * Says what you can do with the primary build.
	 */
	primaryAction: 'install' | 'download' = 'download';
	/**
	 * Whether the primary build is compatible with the current device.
	 */
	primaryIsCompatible = false;
	/**
	 * The "most suitable" build that is able to quick play.
	 */
	browserBuild: GameBuildModel | null = null;
	/**
	 * All of the package's builds excluding primaryBuild and browserBuild. The
	 * order of the builds here is the order they will be displayed in the popup
	 * menu when choosing other builds.
	 *
	 * Their order is the same as the input builds, except builds that are
	 * compatible with the current device are sorted to the top.
	 *
	 * Also, if primaryBuild is installable, it is also prepended to the head of
	 * the list, which allows the user to download the game instead of
	 * installing it.
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
			const winMacLinuxBuilds: { [k: string]: GameBuildModel } = {};
			const browserBasedBuilds: { [k: string]: GameBuildModel } = {};
			const otherBuilds: GameBuildModel[] = [];
			builds.forEach(build => {
				// Browser based builds can be played on the browser.
				if (build.isBrowserBased) {
					browserBasedBuilds[build.type] = build;
					this.platformSupport.push(build.type);
				}
				// ROMs are special cases as they can be treated as
				// downloadables or emulated on the browser.
				else if (build.type === GameBuildType.Rom) {
					browserBasedBuilds[build.type] = build;
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
						winMacLinuxBuilds[platform] = build;
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
			let checkDownloadables = [
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

			checkDownloadables = arrayUnique(checkDownloadables);

			let installableBuild: { platform: string; build: GameBuildModel } | null = null;
			const runnableBuilds: { platform: string; build: GameBuildModel }[] = [];
			let fallbackBuild: { platform: string; build: GameBuildModel } | null = null;

			for (const platform of checkDownloadables) {
				if (!winMacLinuxBuilds[platform]) {
					continue;
				}

				const build = winMacLinuxBuilds[platform];

				// Only resolve the installableBuild on desktop app.
				if (
					GJ_IS_DESKTOP_APP &&
					!installableBuild &&
					canInstallGameBuild({ build, os, arch })
				) {
					installableBuild = { platform, build };
					continue;
				}

				if (canRunGameBuild({ build, os, arch })) {
					runnableBuilds.push({ platform, build });
					continue;
				}

				fallbackBuild ??= { platform, build };
			}

			// Choose the primary build.
			if (installableBuild) {
				this.primaryBuild = installableBuild.build;
				this.primaryPlatform = installableBuild.platform;
				this.primaryAction = 'install';
				this.primaryIsCompatible = true;
			} else if (runnableBuilds.length) {
				this.primaryBuild = runnableBuilds[0].build;
				this.primaryPlatform = runnableBuilds[0].platform;
				this.primaryAction = 'download';
				this.primaryIsCompatible = true;
			} else {
				this.primaryBuild = fallbackBuild?.build ?? null;
				this.primaryPlatform = fallbackBuild?.platform ?? null;
				this.primaryAction = 'download';
				this.primaryIsCompatible = false;
			}

			// Choose the chowcased OS based on the primary build.
			if (this.primaryBuild) {
				this.showcasedOs = this.primaryPlatform!;
				this.showcasedOsIcon = this.platformSupportInfo[this.showcasedOs].icon;
			}

			// Do the same with browser type. Pick the default browser one to
			// show. We include ROMs in browser play.
			['html', 'flash', 'unity', 'applet', 'silverlight', 'rom'].every(type => {
				if (!browserBasedBuilds[type]) {
					return true;
				}

				this.browserBuild = browserBasedBuilds[type];
				this.showcasedBrowserIcon = this.platformSupportInfo[type].icon;
				return false;
			});

			// Pick which release to show between the priamry build and browser build.
			// We prefer showing the latest of the two.
			this.showcasedRelease = this.primaryBuild?._release || null;

			// Lower sort value is a "newer" version.
			if (
				this.browserBuild &&
				(!this.showcasedRelease ||
					this.browserBuild._release!.sort < this.showcasedRelease.sort)
			) {
				this.showcasedRelease = this.browserBuild._release || null;
			}

			const addExtraBuild = (build: GameBuildModel, type: string, sort?: number) => {
				sort ??= this.platformSupportInfo[type]?.sort;
				if (sort === undefined) {
					throw new Error(
						`Could not infer sort value when adding build ${build.id} of type ${type}`
					);
				}

				this.extraBuilds.push({
					type: build.type,
					icon: this.platformSupportInfo[type].icon,
					build: build,
					arch: this.platformSupportInfo[type].arch || null,
					platform: type,
					sort: sort,
				});
			};

			// Populate the extraBuilds.
			//
			// Start with the primary build. In some cases we want to show it in
			// the extra builds as well.
			//
			// prettier-ignore
			const showPrimaryInOther =
				this.primaryBuild && (
					// If its installable we also want to make it downloadable.
					this.primaryAction === 'install' ||
					// If its incompatible with the current device the primary
					// button for it wont actually show, so we need to add it to the
					// extras list.
					!this.primaryIsCompatible
				);

			// Sort value of -100 ensures it is at the top.
			if (showPrimaryInOther) {
				addExtraBuild(this.primaryBuild!, this.primaryPlatform!, -100);
			}

			// All compatible downloadable builds.
			for (const idx in runnableBuilds) {
				const runnable = runnableBuilds[idx];

				// If the primary build is already showing in its own button it doesnt need to show again here.

				// Skip the primary build.
				if (
					!showPrimaryInOther &&
					runnable.build === this.primaryBuild &&
					runnable.platform === this.primaryPlatform
				) {
					continue;
				}

				addExtraBuild(
					runnable.build,
					runnable.platform,
					// We want to sort these after the primary build but before
					// everything else.
					parseInt(idx) - 50
				);
			}

			// All browser builds.
			for (const platform in browserBasedBuilds) {
				const build = browserBasedBuilds[platform];

				// Skip the main browser build.
				if (build === this.browserBuild) {
					continue;
				}

				addExtraBuild(build, platform);
			}

			// All other downloadable builds.
			for (const platform in winMacLinuxBuilds) {
				const build = winMacLinuxBuilds[platform];

				// Skip the primary build.
				if (
					!showPrimaryInOther &&
					build === this.primaryBuild &&
					platform === this.primaryPlatform
				) {
					continue;
				}

				addExtraBuild(build, platform);
			}

			// All other builds.
			for (const build of otherBuilds) {
				let supportKey = 'other';

				// ROMs were added to other builds to make sure they are
				// downloadable. Show the ROM icon for them tho.
				if (build.type === GameBuildType.Rom) {
					supportKey = 'rom';
				}

				addExtraBuild(
					build,
					supportKey,
					// Make sure they are sorted last.
					this.platformSupportInfo[supportKey].sort + 100
				);
			}

			// Sort.
			this.extraBuilds.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
			// Deduplicate by platform (keep first entry).
			this.extraBuilds = this.extraBuilds.filter((value, index, self) => {
				return self.findIndex(v => v.platform === value.platform) === index;
			});

			if (!this.primaryBuild && !this.browserBuild && otherBuilds.length) {
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
	} else if (build.os_windows_64) {
		support.push('windows_64');
	}

	if (build.os_mac) {
		support.push('mac');
	} else if (build.os_mac_64) {
		support.push('mac_64');
	}

	if (build.os_linux) {
		support.push('linux');
	} else if (build.os_linux_64) {
		support.push('linux_64');
	}

	if (!support.length) {
		throw new Error(
			`Expected build to be compatible with at least one known OS. Got build ${build.id} with type ${build.type}.`
		);
	}

	return support;
}
