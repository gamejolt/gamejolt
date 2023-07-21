<script lang="ts" setup>
import { onMounted } from 'vue';
import { GameBuild } from '../../_common/game/build/build.model';
import { loadScript } from '../../utils/utils';
import { useGameserverStore } from '../store/index';

declare const RetroJolt: any;

const RetroJoltBaseUrl = 'https://gamejolt.net/retrojolt/1';

const { url, build } = useGameserverStore();
let emulator: any;

onMounted(async () => {
	await loadScript(`${RetroJoltBaseUrl}/retrojolt.js`);

	switch (build.value!.emulator_type) {
		case GameBuild.EMULATOR_GB:
			_gb();
			break;
		case GameBuild.EMULATOR_GBC:
			_gbc();
			break;
		case GameBuild.EMULATOR_GBA:
			_gba();
			break;
		case GameBuild.EMULATOR_NES:
			_nes();
			break;
		case GameBuild.EMULATOR_VBOY:
			_vboy();
			break;
		case GameBuild.EMULATOR_GENESIS:
			_genesis();
			break;
		case GameBuild.EMULATOR_SNES:
			_snes();
			break;
		case GameBuild.EMULATOR_C64:
			_c64();
			break;
		case GameBuild.EMULATOR_ZX:
			_zx();
			break;
		case GameBuild.EMULATOR_ATARI2600:
			_atari2600();
			break;
		case GameBuild.EMULATOR_CPC:
			_cpc();
			break;
		case GameBuild.EMULATOR_MSX:
			_msx();
			break;
	}
});

function _gb() {
	emulator = new RetroJolt({
		loadingImg: `${RetroJoltBaseUrl}/loading.gif`,
		scale: 4,
		js: `${RetroJoltBaseUrl}/drivers/mamegb.js`,
		driver: 'gameboy',
		bios: [`${RetroJoltBaseUrl}/bios/gameboy.zip`],
		cfg: `${RetroJoltBaseUrl}/cfg/gameboy.cfg`,
		peripherals: ['cart'],
		resolution: [160, 144],
		rom:
			GJ_ENVIRONMENT === 'development'
				? 'https://dl.dropboxusercontent.com/u/71978/rom-test/pokemon.gb'
				: url.value,
	});
}

function _gbc() {
	emulator = new RetroJolt({
		loadingImg: `${RetroJoltBaseUrl}/loading.gif`,
		scale: 4,
		js: `${RetroJoltBaseUrl}/drivers/mamegbc.js`,
		driver: 'gbcolor',
		bios: [`${RetroJoltBaseUrl}/bios/gbcolor.zip`],
		cfg: `${RetroJoltBaseUrl}/cfg/gbcolor.cfg`,
		peripherals: ['cart'],
		resolution: [160, 144],
		rom:
			GJ_ENVIRONMENT === 'development'
				? 'https://dl.dropboxusercontent.com/u/71978/rom-test/pokemon-crystal.gbc'
				: url.value,
	});
}

function _gba() {
	emulator = new RetroJolt({
		loadingImg: `${RetroJoltBaseUrl}/loading.gif`,
		scale: 3,
		js: `${RetroJoltBaseUrl}/drivers/mamegba.js`,
		driver: 'gba',
		bios: [`${RetroJoltBaseUrl}/bios/gba.zip`],
		cfg: `${RetroJoltBaseUrl}/cfg/gba.cfg`,
		peripherals: ['cart'],
		resolution: [240, 160],
		rom:
			GJ_ENVIRONMENT === 'development'
				? 'https://dl.dropboxusercontent.com/u/71978/rom-test/zelda.gba'
				: url.value,
	});
}

function _nes() {
	emulator = new RetroJolt({
		loadingImg: `${RetroJoltBaseUrl}/loading.gif`,
		scale: 2,
		js: `${RetroJoltBaseUrl}/drivers/mamenes.js`,
		driver: 'nes',
		cfg: `${RetroJoltBaseUrl}/cfg/nes.cfg`,
		peripherals: ['cart'],
		resolution: [256, 240],
		rom:
			GJ_ENVIRONMENT === 'development'
				? 'https://dl.dropboxusercontent.com/u/71978/rom-test/smb3.nes'
				: url.value,
	});
}

function _vboy() {
	emulator = new RetroJolt({
		loadingImg: `${RetroJoltBaseUrl}/loading.gif`,
		js: `${RetroJoltBaseUrl}/drivers/mamevirtualboy.js`,
		driver: 'vboy',
		cfg: `${RetroJoltBaseUrl}/cfg/vboy.cfg`,
		peripherals: ['cart'],
		resolution: [384 * 2, 224],
		rom:
			GJ_ENVIRONMENT === 'development'
				? 'https://dl.dropboxusercontent.com/u/71978/rom-test/golf.vb'
				: url.value,
	});
}

function _genesis() {
	emulator = new RetroJolt({
		loadingImg: `${RetroJoltBaseUrl}/loading.gif`,
		scale: 2,
		js: `${RetroJoltBaseUrl}/drivers/mamegenesis.js`,
		driver: 'genesis',
		cfg: `${RetroJoltBaseUrl}/cfg/genesis.cfg`,
		peripherals: ['cart'],
		resolution: [320, 224],
		rom:
			GJ_ENVIRONMENT === 'development'
				? 'https://dl.dropboxusercontent.com/u/71978/rom-test/sonic.md'
				: url.value,
	});
}

function _snes() {
	emulator = new RetroJolt({
		loadingImg: `${RetroJoltBaseUrl}/loading.gif`,
		scale: 2,
		js: `${RetroJoltBaseUrl}/drivers/mamesnes.js`,
		driver: 'snes',
		bios: [`${RetroJoltBaseUrl}/bios/snes.zip`],
		cfg: `${RetroJoltBaseUrl}/cfg/snes.cfg`,
		peripherals: ['cart'],
		resolution: [256, 224],
		rom:
			GJ_ENVIRONMENT === 'development'
				? 'https://dl.dropboxusercontent.com/u/71978/rom-test/chrono-trigger.sfc'
				: url.value,
	});
}

function _c64() {
	emulator = new RetroJolt({
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
			GJ_ENVIRONMENT === 'development'
				? 'https://dl.dropboxusercontent.com/u/71978/rom-test/sys4096.prg'
				: url.value,
	});
}

function _zx() {
	emulator = new RetroJolt({
		loadingImg: `${RetroJoltBaseUrl}/loading.gif`,
		scale: 2,
		js: `${RetroJoltBaseUrl}/drivers/mamespectrum.js`,
		driver: 'spec128',
		bios: [`${RetroJoltBaseUrl}/bios/spec128.zip`],
		cfg: `${RetroJoltBaseUrl}/cfg/spectrum.cfg`,
		peripherals: ['dump'],
		resolution: [352, 296],
		rom:
			GJ_ENVIRONMENT === 'development'
				? 'https://dl.dropboxusercontent.com/u/71978/rom-test/test.z80'
				: url.value,
	});
}

function _atari2600() {
	emulator = new RetroJolt({
		loadingImg: `${RetroJoltBaseUrl}/loading.gif`,
		scale: 2,
		js: `${RetroJoltBaseUrl}/drivers/mamea2600.js`,
		driver: 'a2600',
		cfg: `${RetroJoltBaseUrl}/cfg/a2600.cfg`,
		peripherals: ['cart'],
		resolution: [176, 223],
		rom:
			GJ_ENVIRONMENT === 'development'
				? 'https://dl.dropboxusercontent.com/u/71978/rom-test/pacman.a26'
				: url.value,
	});
}

function _cpc() {
	const romFullPath =
		GJ_ENVIRONMENT === 'development'
			? 'https://dl.dropboxusercontent.com/u/71978/rom-test/zrealms.dsk'
			: url.value;

	const filename = RetroJolt.getFilenameFromUrl(romFullPath);

	const pieces = filename.split('.');
	pieces.pop();

	const gameName = pieces.join('.');

	emulator = new RetroJolt({
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

function _msx() {
	emulator = new RetroJolt({
		loadingImg: `${RetroJoltBaseUrl}/loading.gif`,
		scale: 2,
		js: `${RetroJoltBaseUrl}/drivers/mamemsx.js`,
		driver: 'mlg10',
		bios: [`${RetroJoltBaseUrl}/bios/mlg10.zip`],
		cfg: `${RetroJoltBaseUrl}/cfg/msx.cfg`,
		peripherals: ['cart1'],
		resolution: [272, 233],
		rom:
			GJ_ENVIRONMENT === 'development'
				? 'https://dl.dropboxusercontent.com/u/71978/rom-test/brazil.mx1'
				: url.value,
	});
}
</script>

<template>
	<canvas
		v-if="build"
		id="emulator-target"
		style="display: block; margin: 0 auto; padding: 0"
		:style="{
			width: `${build.embed_width}px`,
			height: `${build.embed_height}px`,
		}"
	/>
</template>
