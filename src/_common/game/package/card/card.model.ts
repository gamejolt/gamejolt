import { arrayUnique } from '../../../../utils/array';
import { getDeviceArch, getDeviceOS } from '../../../device/device.service';
import { Jolticon } from '../../../jolticon/AppJolticon.vue';
import { LinkedKey } from '../../../linked-key/linked-key.model';
import { Sellable } from '../../../sellable/sellable.model';
import {
	GameBuild,
	GameBuildPlatformSupportInfo,
	GameBuildType,
	pluckGameBuildOsSupport,
} from '../../build/build.model';
import { GameRelease } from '../../release/release.model';

interface ExtraBuild {
	type: string;
	icon: Jolticon;
	build: GameBuild;
	platform: string;
	arch: string | null;
}

export class GamePackageCardModel {
	platformSupportInfo = Object.assign({}, GameBuildPlatformSupportInfo);
	platformSupport: string[] = [];
	downloadableBuild: GameBuild | null = null;
	browserBuild: GameBuild | null = null;
	extraBuilds: ExtraBuild[] = [];
	showcasedRelease: GameRelease | null = null;
	showcasedOs = '';
	showcasedOsIcon = '';
	showcasedBrowserIcon = '';
	otherOnly = false;
	linkedKeys: LinkedKey[] = [];

	get hasSteamKey() {
		return this.platformSupport.indexOf('steam') !== -1;
	}

	constructor(
		sellable: Sellable,
		releases: GameRelease[],
		builds: GameBuild[],
		linkedKeys?: LinkedKey[]
	) {
		if (builds) {
			const os = getDeviceOS();
			const arch = getDeviceArch();

			// Indexes by the os/type of the build: [ { type: build } ]
			// While looping we also gather all OS/browser support for this complete package.
			const indexedBuilds: { [k: string]: GameBuild } = {};
			const otherBuilds: GameBuild[] = [];
			builds.forEach(build => {
				if (build.isBrowserBased) {
					indexedBuilds[build.type] = build;
					this.platformSupport.push(build.type);
				} else if (build.type === GameBuildType.Rom) {
					indexedBuilds[build.type] = build;
					this.platformSupport.push(build.type);
					otherBuilds.push(build);
				} else if (build.os_other) {
					otherBuilds.push(build);
				} else {
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
			// we need to try to pick one to showcase as the default download. We put
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

			checkDownloadables.every(_os => {
				if (!indexedBuilds[_os]) {
					return true;
				}

				this.downloadableBuild = indexedBuilds[_os];
				this.showcasedOs = _os;
				this.showcasedOsIcon = this.platformSupportInfo[_os].icon;
				return false;
			});

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

			// Pull the showcased release version.
			// It should be the greater one for either the downloadable or browser build chosen.
			if (this.downloadableBuild) {
				this.showcasedRelease = this.downloadableBuild._release || null;
			}

			// Lower sort value is a "newer" version.
			if (
				this.browserBuild &&
				(!this.showcasedRelease ||
					this.browserBuild._release!.sort < this.showcasedRelease.sort)
			) {
				this.showcasedRelease = this.browserBuild._release || null;
			}

			const addExtraBuild = (build: GameBuild, type: string) => {
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

				if (build === this.downloadableBuild && type === this.showcasedOs) {
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

			if (!this.downloadableBuild && !this.browserBuild && otherBuilds.length) {
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
