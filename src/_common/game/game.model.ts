import { Router } from 'vue-router';
import type { RouteLocationDefinition } from '../../utils/router';
import { Api } from '../api/api.service';
import { Collaboratable } from '../collaborator/collaboratable';
import { CommentableModel } from '../comment/comment-model';
import { Community } from '../community/community.model';
import { ContentContainerModel } from '../content/content-container-model';
import { ContentContext } from '../content/content-context';
import { ContentSetCache } from '../content/content-set-cache';
import { showErrorGrowl } from '../growls/growls.service';
import { MediaItem } from '../media-item/media-item-model';
import { Model } from '../model/model.service';
import { Registry } from '../registry/registry.service';
import { Sellable } from '../sellable/sellable.model';
import { Site } from '../site/site-model';
import { Theme } from '../theme/theme.model';
import { $gettext } from '../translate/translate.service';
import { User } from '../user/user.model';
import { GameBuild, GameBuildType } from './build/build.model';
import { GamePackage } from './package/package.model';

export interface CustomGameMessage {
	type: 'info' | 'alert';
	message: string;
	class: string;
}

export const GameCreationToolOther = 'Other';

export const enum GameStatus {
	Hidden = 0,
	Visible = 1,
	Removed = 2,
}

export const enum GameDevelopmentStatus {
	Finished = 1,
	Wip = 2,
	Canceled = 3,
	Devlog = 4,
}

export const enum GameLockedStatus {
	Unlocked = 0,
	Dmca = 1,
	Adult = 3,
}

export class Game extends Collaboratable(Model) implements ContentContainerModel, CommentableModel {
	declare developer: User;
	declare thumbnail_media_item?: MediaItem;
	declare header_media_item?: MediaItem;
	declare community?: Community;
	declare title: string;
	declare slug: string;
	declare path: string;
	declare img_thumbnail: string;
	declare has_animated_thumbnail: boolean;
	declare img_thumbnail_webm: string;
	declare img_thumbnail_mp4: string;
	declare media_count: number;
	declare follower_count: number;
	declare ratings_enabled: boolean;
	declare referrals_enabled: boolean;
	declare compatibility: any;
	declare modified_on: number;
	declare posted_on: number;
	declare published_on: number;
	declare status: GameStatus;
	declare development_status: GameDevelopmentStatus;
	declare canceled: boolean;
	declare tigrs_age: number;
	declare sellable?: Sellable;
	declare can_user_rate?: boolean;
	declare is_following?: boolean;
	declare has_adult_content: boolean;
	declare should_show_ads: boolean;
	declare like_count: number;
	declare sites_enabled: boolean;

	// Meta settings
	declare creation_tool?: string;
	declare creation_tool_other?: string;
	declare creation_tool_human?: string;
	declare web_site?: string;
	declare bundle_only?: boolean;
	declare ga_tracking_id?: string;
	declare comments_enabled?: boolean;

	declare avg_rating?: number;
	declare rating_count?: number;

	// Maturity settings
	declare tigrs_cartoon_violence?: number;
	declare tigrs_fantasy_violence?: number;
	declare tigrs_realistic_violence?: number;
	declare tigrs_bloodshed?: number;
	declare tigrs_sexual_violence?: number;
	declare tigrs_alcohol?: number;
	declare tigrs_drugs?: number;
	declare tigrs_tobacco?: number;
	declare tigrs_nudity?: number;
	declare tigrs_sexual_themes?: number;
	declare tigrs_language?: number;
	declare tigrs_humor?: number;
	declare tigrs_gambling?: number;

	// Description settings
	declare description_content: string;

	// Manage settings
	declare has_sales?: boolean;
	declare has_active_builds?: boolean;
	declare is_listable?: boolean;
	declare is_locked?: boolean;
	declare locked_status?: GameLockedStatus;

	declare site?: Site;
	declare theme?: Theme;

	constructor(data: any = {}) {
		super(data);

		if (data.developer) {
			this.developer = new User(data.developer);
		}

		if (data.thumbnail_media_item) {
			this.thumbnail_media_item = new MediaItem(data.thumbnail_media_item);
		}

		if (data.header_media_item) {
			this.header_media_item = new MediaItem(data.header_media_item);
		}

		if (data.site) {
			this.site = new Site(data.site);
		}

		// Should show as owned for the dev and collaborators of the game.
		if (data.sellable) {
			this.sellable = new Sellable(data.sellable);
			if (this.sellable.type !== 'free' && this.hasPerms()) {
				this.sellable.is_owned = true;
			}
		}

		if (data.theme) {
			this.theme = new Theme(data.theme);
		}

		if (data.community) {
			this.community = new Community(data.community);
		}

		Registry.store('Game', this);
	}

	get is_paid_game() {
		return this.sellable?.type === 'paid';
	}

	get isOwned() {
		return this.sellable?.is_owned === true;
	}

	get _can_buy_primary_sellable() {
		return this.is_paid_game && this.sellable?.is_owned === false;
	}

	// We don't want to show ads if this game has sellable items.
	get _should_show_ads() {
		return this.should_show_ads && (!this.sellable || this.sellable.type === 'free');
	}

	get _is_finished() {
		return this.development_status === GameDevelopmentStatus.Finished;
	}

	get _is_wip() {
		return this.development_status === GameDevelopmentStatus.Wip;
	}

	get _is_devlog() {
		return this.development_status === GameDevelopmentStatus.Devlog;
	}

	get isVisible() {
		return this.status === GameStatus.Visible;
	}

	get isUnlisted() {
		return this.status === GameStatus.Hidden;
	}

	get _has_cover() {
		return !!this.header_media_item;
	}

	get _has_packages() {
		if (this.compatibility) {
			const keys = Object.keys(this.compatibility);
			for (let i = 0; i < keys.length; ++i) {
				if (keys[i] !== 'id' && keys[i] !== 'game_id') {
					return true;
				}
			}
		}
		return false;
	}

	get routeLocation(): RouteLocationDefinition {
		return {
			name: 'discover.games.view.overview',
			params: this.getSrefParams(),
		};
	}

	get hasDescription() {
		const cache = ContentSetCache.getCache(this, 'game-description');
		return cache.hasContent;
	}

	get hasAnyBlock() {
		return this.developer.hasAnyBlock;
	}

	get canViewComments() {
		return !!this.comments_enabled;
	}

	get canMakeComment() {
		return !!this.comments_enabled && !this.hasAnyBlock;
	}

	get canInteractWithComments() {
		return !!this.comments_enabled && !this.hasAnyBlock;
	}

	getContent(context: ContentContext) {
		if (context === 'game-description') {
			return this.description_content;
		}
		throw new Error(`Context ${context} is not defined for Game.`);
	}

	getSref(page = '', includeParams = false) {
		let sref = '';

		if (page === 'dashboard') {
			sref = 'dash.games.manage.game.overview';
		} else if (page === 'edit') {
			sref = 'dash.games.manage.game.details';
		} else {
			sref = 'discover.games.view.overview';
		}

		if (includeParams) {
			sref += '( ' + JSON.stringify(this.getSrefParams(page)) + ' )';
		}

		return sref;
	}

	getSrefParams(page = ''): { [key: string]: string } {
		if (['dashboard', 'edit'].indexOf(page) !== -1) {
			return { id: this.id + '' };
		}

		return {
			id: this.id + '',
			slug: this.slug,
		};
	}

	getUrl(page = '') {
		if (page === 'soundtrack') {
			return `/get/soundtrack?game=${this.id}`;
		}
		return '/games/' + this.slug + '/' + this.id;
	}

	hasDesktopSupport(): boolean {
		const compat = this.compatibility;
		return (
			compat.os_windows ||
			compat.os_windows_64 ||
			compat.os_mac ||
			compat.os_mac_64 ||
			compat.os_linux ||
			compat.os_linux_64
		);
	}

	hasBrowserSupport(): boolean {
		const compat = this.compatibility;
		return (
			compat.type_html ||
			compat.type_flash ||
			compat.type_unity ||
			compat.type_applet ||
			compat.type_silverlight
		);
	}

	canInstall(os: string, arch: string | undefined): boolean {
		// Obviously can't install if no desktop build.
		if (!this.hasDesktopSupport()) {
			return false;
		}

		return checkGameDeviceSupport(this.compatibility, os, arch);
	}

	$save() {
		if (this.id) {
			return this.$_save('/web/dash/developer/games/save/' + this.id, 'game');
		} else {
			return this.$_save('/web/dash/developer/games/save', 'game');
		}
	}

	$saveDescription() {
		return this.$_save('/web/dash/developer/games/description/save/' + this.id, 'game');
	}

	$saveMaturity() {
		return this.$_save('/web/dash/developer/games/maturity/save/' + this.id, 'game');
	}

	$saveThumbnail() {
		return this.$_save('/web/dash/developer/games/thumbnail/save/' + this.id, 'game', {
			file: this.file,
			allowComplexData: ['crop'],
		});
	}

	$saveHeader() {
		return this.$_save('/web/dash/developer/games/header/save/' + this.id, 'game', {
			file: this.file,
			allowComplexData: ['crop'],
		});
	}

	$clearHeader() {
		return this.$_save('/web/dash/developer/games/header/clear/' + this.id, 'game');
	}

	$saveSettings() {
		return this.$_save('/web/dash/developer/games/settings/save/' + this.id, 'game');
	}

	$saveDesign() {
		return this.$_save('/web/dash/developer/games/design/save/' + this.id, 'game', {
			allowComplexData: ['theme'],
		});
	}

	$setStatus(status: number) {
		return this.$_save('/web/dash/developer/games/set-status/' + this.id, 'game', {
			data: { status },
		});
	}

	$setDevStage(stage: number) {
		return this.$_save(
			'/web/dash/developer/games/set-dev-stage/' + this.id + '/' + stage,
			'game',
			{
				data: { stage },
			}
		);
	}

	$setCanceled(isCanceled: boolean) {
		return this.$_save(
			'/web/dash/developer/games/set-canceled/' + this.id + '/' + (isCanceled ? '1' : '0'),
			'game'
		);
	}

	$remove() {
		return this.$_remove('/web/dash/developer/games/remove/' + this.id);
	}
}

/**
 * Helper function to check if the resource passed in has support for the
 * os/arch passed in.
 */
export function checkGameDeviceSupport(obj: any, os: string, arch: string | undefined): boolean {
	if (obj['os_' + os]) {
		return true;
	}

	// If they are on 64bit, then we can check for 64bit only support as well.
	// If there is no arch (web site context) then we allow 64bit builds as well.
	if ((!arch || arch === '64') && obj['os_' + os + '_64']) {
		return true;
	}

	return false;
}

export function pluckInstallableGameBuilds(
	packages: GamePackage[],
	os: string,
	arch?: string
): GameBuild[] {
	const pluckedBuilds: GameBuild[] = [];

	packages.forEach(_package => {
		// Don't include builds for packages that aren't bought yet.
		// Can't install them if they can't be bought.
		if (
			_package._sellable &&
			_package._sellable.type === 'paid' &&
			!_package._sellable.is_owned
		) {
			return;
		}

		if (_package._builds) {
			_package._builds.forEach(build => {
				if (checkGameDeviceSupport(build, os, arch)) {
					pluckedBuilds.push(build);
				}
			});
		}
	});

	return pluckedBuilds;
}

export function pluckDownloadableGameBuilds(packages: GamePackage[]) {
	return _pluckBuilds(packages, i => i.isDownloadable);
}

export function pluckBrowserGameBuilds(packages: GamePackage[]) {
	return _pluckBuilds(packages, i => i.isBrowserBased);
}

export function pluckRomGameBuilds(packages: GamePackage[]) {
	return _pluckBuilds(packages, i => i.type === GameBuildType.Rom);
}

function _pluckBuilds(packages: GamePackage[], func: (build: GameBuild) => boolean) {
	const pluckedBuilds: GameBuild[] = [];

	packages.forEach((_package: GamePackage) => {
		if (!_package._builds) {
			return;
		}

		_package._builds.forEach(build => {
			if (func(build)) {
				pluckedBuilds.push(build);
			}
		});
	});

	return pluckedBuilds;
}

export function chooseBestGameBuild(builds: GameBuild[], os: string, arch?: string) {
	const sortedBuilds = builds.sort((a, b) => a._release!.sort - b._release!.sort);

	const build32 = sortedBuilds.find(build => build.isPlatform(os));
	const build64 = sortedBuilds.find(build => build.isPlatform(os, '64'));

	// If they are on 64bit, and we have a 64 bit build, we should try to
	// use it.
	if (arch === '64' && build64) {
		// If the 64bit build is an older version than the 32bit build, then
		// we have to use 32bit anyway.
		if (!build32 || build64._release!.sort <= build32._release!.sort) {
			return build64;
		}
	}

	if (build32) {
		return build32;
	}

	return builds[0];
}

export async function followGame(game: Game) {
	game.is_following = true;
	++game.follower_count;

	try {
		return await Api.sendRequest(
			'/web/library/games/add/followed',
			{
				game_id: game.id,
				timestamp: Date.now(),
			},
			{
				detach: true,
			}
		);
	} catch (e) {
		game.is_following = false;
		--game.follower_count;
		throw e;
	}
}

export async function unfollowGame(game: Game) {
	game.is_following = false;
	--game.follower_count;

	try {
		return await game.$_remove('/web/library/games/remove/followed/' + game.id, {
			data: {
				timestamp: Date.now(),
			},
		});
	} catch (e) {
		game.is_following = true;
		++game.follower_count;
		throw e;
	}
}

export function handleGameAddFailure(user: User, reason: string, router: Router) {
	switch (reason) {
		case 'game-limit-reached':
			showErrorGrowl(
				$gettext(`You've reached the limit of how many games you can collaborate on.`)
			);
			break;

		default:
			showErrorGrowl($gettext(`You cannot add a new game or collaborate on this game.`));
			break;
	}

	router.push({
		name: 'library.collection.developer',
		params: { id: user.username },
	});
}
