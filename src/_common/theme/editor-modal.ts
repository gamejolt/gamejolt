import { Component } from 'vue-property-decorator';
import View from '!view!./editor-modal.html?style=./editor-modal.styl';

import { BaseModal } from '../../lib/gj-lib-client/components/modal/base';
import { Theme } from './theme.service';
import { ThemeModel } from './theme.model';
import { AppThemeCluster } from './cluster/cluster';
import { AppTooltip } from '../../lib/gj-lib-client/components/tooltip/tooltip';

@View
@Component({
	components: {
		AppThemeCluster,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppThemeEditorModal extends BaseModal {
	theme = Theme.theme;
	presets: { [k: string]: ThemeModel } = {
		'Game Jolt': new ThemeModel('#ccff00', '#2f7f6f', '#ff3fac'),
		Mochi: new ThemeModel('#a3ff78', '#537c40', '#ff6acc'),
		GlowPaint: new ThemeModel('#46ff76', '#512762', '#ff3b3b'),
		Meadow: new ThemeModel('#00ffa8', '#006960', '#ff4200'),
		JelPens: new ThemeModel('#00ffc0', '#775abd', '#ff009c'),
		Aquarium: new ThemeModel('#00ffd2', '#00555f', '#ff4080'),
		Seaplane: new ThemeModel('#92b6f9', '#203469', '#ff3c00'),
		Lupin: new ThemeModel('#eda4ff', '#8759a7', '#ff237b'),
		Rose: new ThemeModel('#ff73bf', '#61639a', '#ff134b'),
		ToxicVHS: new ThemeModel('#ff86b1', '#1f6667', '#ff0084'),
		GarterSnake: new ThemeModel('#ff9cc4', '#205557', '#ff0072'),
		Mainsail: new ThemeModel('#fff65f', '#5f8698', '#ff5337'),
		Snowcone: new ThemeModel('#fffd6f', '#ab2956', '#ff5628'),
		Autumn: new ThemeModel('#ffe400', '#4c6f67', '#ff4c2e'),
		Hydraulic: new ThemeModel('#ffb238', '#532a2a', '#ff4200'),
		Larkspur: new ThemeModel('#ffba00', '#003cab', '#ff00a8'),
		Sherbet: new ThemeModel('#ffad56', '#942d4e', '#ff3c00'),
		Shortcake: new ThemeModel('#cb8659', '#5b3821', '#ff4080'),
		Cedar: new ThemeModel('#ffd052', '#93625c', '#ff4800'),
		Diamondback: new ThemeModel('#f1ce71', '#807258', '#ff5a00'),

		Red: new ThemeModel('#ff3333', '#4c0029', '#ff0078'),
		Vermilion: new ThemeModel('#ff541c', '#4c1300', '#ff0078'),
		Amber: new ThemeModel('#ff7f00', '#641a00', '#ff0078'),
		Gold: new ThemeModel('#ffbf00', '#795300', '#ff004e'),
		Yellow: new ThemeModel('#ffff00', '#837500', '#ff004e'),
		Apple: new ThemeModel('#c0ff00', '#356700', '#ff004e'),
		Chartreuse: new ThemeModel('#80ff00', '#00672c', '#ff004e'),
		Lime: new ThemeModel('#40ff00', '#1b6c00', '#ff004e'),
		Green: new ThemeModel('#4cff4c', '#005236', '#ff004e'),
		Mint: new ThemeModel('#20ff57', '#005133', '#ff004e'),
		Jade: new ThemeModel('#32ff98', '#005147', '#ff004e'),
		Turquoise: new ThemeModel('#00ffbf', '#00494a', '#ff004e'),
		Cyan: new ThemeModel('#5fffff', '#435d5d', '#ff004e'),
		Azure: new ThemeModel('#00c0ff', '#003864', '#ff004e'),
		Sapphire: new ThemeModel('#2994ff', '#163066', '#ff004e'),
		Cobalt: new ThemeModel('#5681ff', '#150073', '#ff004e'),
		'Blue Silver': new ThemeModel('#aaaaff', '#3a3ca6', '#ff004e'),
		Violet: new ThemeModel('#ab90ff', '#3b1c97', '#ff004e'),
		Purple: new ThemeModel('#b974ff', '#00078c', '#ff004e'),
		Orchid: new ThemeModel('#d761ff', '#3d0082', '#ff004e'),
		Magenta: new ThemeModel('#ff46ff', '#3d0082', '#ff004e'),
		Fuchsia: new ThemeModel('#ff25c9', '#4d0d76', '#ff004e'),
		Carmine: new ThemeModel('#ff1b8d', '#4d0d76', '#ff5400'),
		Scarlet: new ThemeModel('#ff2f63', '#490077', '#ff5400'),
		Silver: new ThemeModel('#bfc7db', '#596175', '#ff004e'),
		'Pure Gray': new ThemeModel('#c1c1c1', '#535353', '#ff004e'),
	};

	selectPreset(preset: ThemeModel) {
		Theme.theme.notice = preset.notice;
		Theme.theme.highlight = preset.highlight;
		Theme.theme.backlight = preset.backlight;
	}
}
