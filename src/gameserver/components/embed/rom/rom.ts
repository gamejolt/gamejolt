import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./rom.html';

import { GameBuild } from '../../../../lib/gj-lib-client/components/game/build/build.model';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { loadScript } from '../../../../lib/gj-lib-client/utils/utils';
import { Store } from '../../../store/index';

declare const RetroJolt: any;

const RetroJoltBaseUrl = 'https://gamejolt.net/retrojolt/1';

@View
@Component({})
export class AppEmbedRom extends Vue {
	@State url!: Store['url'];
	@State build!: Store['build'];
	@State username!: Store['username'];
	@State token!: Store['token'];

	emulator: any;

	async mounted() {
		await loadScript(`${RetroJoltBaseUrl}/retrojolt.js`);

		switch (this.build!.emulator_type) {
			case GameBuild.EMULATOR_GB:
				this.gb();
				break;
			case GameBuild.EMULATOR_GBC:
				this.gbc();
				break;
			case GameBuild.EMULATOR_GBA:
				this.gba();
				break;
			case GameBuild.EMULATOR_NES:
				this.nes();
				break;
			case GameBuild.EMULATOR_VBOY:
				this.vboy();
				break;
			case GameBuild.EMULATOR_GENESIS:
				this.genesis();
				break;
			case GameBuild.EMULATOR_SNES:
				this.snes();
				break;
			case GameBuild.EMULATOR_C64:
				this.c64();
				break;
			case GameBuild.EMULATOR_ZX:
				this.zx();
				break;
			case GameBuild.EMULATOR_ATARI2600:
				this.atari2600();
				break;
			case GameBuild.EMULATOR_CPC:
				this.cpc();
				break;
			case GameBuild.EMULATOR_MSX:
				this.msx();
				break;
			case GameBuild.EMULATOR_GBC:
				this.gbc();
				break;
			case GameBuild.EMULATOR_GBC:
				this.gbc();
				break;
			case GameBuild.EMULATOR_GBC:
				this.gbc();
				break;
		}
	}

	gb() {
		this.emulator = new RetroJolt({
			loadingImg: `${RetroJoltBaseUrl}/loading.gif`,
			scale: 4,
			js: `${RetroJoltBaseUrl}/drivers/mamegb.js`,
			driver: 'gameboy',
			bios: [`${RetroJoltBaseUrl}/bios/gameboy.zip`],
			cfg: `${RetroJoltBaseUrl}/cfg/gameboy.cfg`,
			peripherals: ['cart'],
			resolution: [160, 144],
			rom:
				Environment.env === 'development'
					? 'https://dl.dropboxusercontent.com/u/71978/rom-test/pokemon.gb'
					: this.url,
		});
	}

	gbc() {
		this.emulator = new RetroJolt({
			loadingImg: `${RetroJoltBaseUrl}/loading.gif`,
			scale: 4,
			js: `${RetroJoltBaseUrl}/drivers/mamegbc.js`,
			driver: 'gbcolor',
			bios: [`${RetroJoltBaseUrl}/bios/gbcolor.zip`],
			cfg: `${RetroJoltBaseUrl}/cfg/gbcolor.cfg`,
			peripherals: ['cart'],
			resolution: [160, 144],
			rom:
				Environment.env === 'development'
					? 'https://dl.dropboxusercontent.com/u/71978/rom-test/pokemon-crystal.gbc'
					: this.url,
		});
	}

	gba() {
		this.emulator = new RetroJolt({
			loadingImg: `${RetroJoltBaseUrl}/loading.gif`,
			scale: 3,
			js: `${RetroJoltBaseUrl}/drivers/mamegba.js`,
			driver: 'gba',
			bios: [`${RetroJoltBaseUrl}/bios/gba.zip`],
			cfg: `${RetroJoltBaseUrl}/cfg/gba.cfg`,
			peripherals: ['cart'],
			resolution: [240, 160],
			rom:
				Environment.env === 'development'
					? 'https://dl.dropboxusercontent.com/u/71978/rom-test/zelda.gba'
					: this.url,
		});
	}

	nes() {
		this.emulator = new RetroJolt({
			loadingImg: `${RetroJoltBaseUrl}/loading.gif`,
			scale: 2,
			js: `${RetroJoltBaseUrl}/drivers/mamenes.js`,
			driver: 'nes',
			cfg: `${RetroJoltBaseUrl}/cfg/nes.cfg`,
			peripherals: ['cart'],
			resolution: [256, 240],
			rom:
				Environment.env === 'development'
					? 'https://dl.dropboxusercontent.com/u/71978/rom-test/smb3.nes'
					: this.url,
		});
	}

	vboy() {
		this.emulator = new RetroJolt({
			loadingImg: `${RetroJoltBaseUrl}/loading.gif`,
			js: `${RetroJoltBaseUrl}/drivers/mamevirtualboy.js`,
			driver: 'vboy',
			cfg: `${RetroJoltBaseUrl}/cfg/vboy.cfg`,
			peripherals: ['cart'],
			resolution: [384 * 2, 224],
			rom:
				Environment.env === 'development'
					? 'https://dl.dropboxusercontent.com/u/71978/rom-test/golf.vb'
					: this.url,
		});
	}

	genesis() {
		this.emulator = new RetroJolt({
			loadingImg: `${RetroJoltBaseUrl}/loading.gif`,
			scale: 2,
			js: `${RetroJoltBaseUrl}/drivers/mamegenesis.js`,
			driver: 'genesis',
			cfg: `${RetroJoltBaseUrl}/cfg/genesis.cfg`,
			peripherals: ['cart'],
			resolution: [320, 224],
			rom:
				Environment.env === 'development'
					? 'https://dl.dropboxusercontent.com/u/71978/rom-test/sonic.md'
					: this.url,
		});
	}

	snes() {
		this.emulator = new RetroJolt({
			loadingImg: `${RetroJoltBaseUrl}/loading.gif`,
			scale: 2,
			js: `${RetroJoltBaseUrl}/drivers/mamesnes.js`,
			driver: 'snes',
			bios: [`${RetroJoltBaseUrl}/bios/snes.zip`],
			cfg: `${RetroJoltBaseUrl}/cfg/snes.cfg`,
			peripherals: ['cart'],
			resolution: [256, 224],
			rom:
				Environment.env === 'development'
					? 'https://dl.dropboxusercontent.com/u/71978/rom-test/chrono-trigger.sfc'
					: this.url,
		});
	}

	c64() {
		this.emulator = new RetroJolt({
			loadingImg: `${RetroJoltBaseUrl}/loading.gif`,
			scale: 2,
			js: `${RetroJoltBaseUrl}/drivers/mamec64.js`,
			driver: 'c64',
			bios: [`${RetroJoltBaseUrl}/bios/c64.zip`],
			cfg: `${RetroJoltBaseUrl}/cfg/c64.cfg`,
			peripherals: ['quik'],
			resolution: [418, 235],
			args: ['-ab', 'sys4096\\n', '-autoboot_delay', '4'],
			rom:
				Environment.env === 'development'
					? 'https://dl.dropboxusercontent.com/u/71978/rom-test/sys4096.prg'
					: this.url,
		});
	}

	zx() {
		this.emulator = new RetroJolt({
			loadingImg: `${RetroJoltBaseUrl}/loading.gif`,
			scale: 2,
			js: `${RetroJoltBaseUrl}/drivers/mamespectrum.js`,
			driver: 'spec128',
			bios: [`${RetroJoltBaseUrl}/bios/spec128.zip`],
			cfg: `${RetroJoltBaseUrl}/cfg/spectrum.cfg`,
			peripherals: ['dump'],
			resolution: [352, 296],
			rom:
				Environment.env === 'development'
					? 'https://dl.dropboxusercontent.com/u/71978/rom-test/test.z80'
					: this.url,
		});
	}

	atari2600() {
		this.emulator = new RetroJolt({
			loadingImg: `${RetroJoltBaseUrl}/loading.gif`,
			scale: 2,
			js: `${RetroJoltBaseUrl}/drivers/mamea2600.js`,
			driver: 'a2600',
			cfg: `${RetroJoltBaseUrl}/cfg/a2600.cfg`,
			peripherals: ['cart'],
			resolution: [176, 223],
			rom:
				Environment.env === 'development'
					? 'https://dl.dropboxusercontent.com/u/71978/rom-test/pacman.a26'
					: this.url,
		});
	}

	cpc() {
		const romFullPath =
			Environment.env === 'development'
				? 'https://dl.dropboxusercontent.com/u/71978/rom-test/zrealms.dsk'
				: this.url;

		const filename = RetroJolt.getFilenameFromUrl(romFullPath);

		let pieces = filename.split('.');
		pieces.pop();

		const gameName = pieces.join('.');

		this.emulator = new RetroJolt({
			loadingImg: `${RetroJoltBaseUrl}/loading.gif`,
			scale: 2,
			js: `${RetroJoltBaseUrl}/drivers/mameamstrad.js`,
			driver: 'cpc6128',
			bios: [`${RetroJoltBaseUrl}/bios/cpc6128.zip`, `${RetroJoltBaseUrl}/bios/cpc464.zip`],
			cfg: `${RetroJoltBaseUrl}/cfg/amstrad.cfg`,
			peripherals: ['flop1'],
			resolution: [384, 272],
			args: ['-ab', `run"${gameName}\n`, '-autoboot_delay', '2'],
			rom: romFullPath,
		});
	}

	msx() {
		this.emulator = new RetroJolt({
			loadingImg: `${RetroJoltBaseUrl}/loading.gif`,
			scale: 2,
			js: `${RetroJoltBaseUrl}/drivers/mamemsx.js`,
			driver: 'mlg10',
			bios: [`${RetroJoltBaseUrl}/bios/mlg10.zip`],
			cfg: `${RetroJoltBaseUrl}/cfg/msx.cfg`,
			peripherals: ['cart1'],
			resolution: [272, 233],
			rom:
				Environment.env === 'development'
					? 'https://dl.dropboxusercontent.com/u/71978/rom-test/brazil.mx1'
					: this.url,
		});
	}
}
