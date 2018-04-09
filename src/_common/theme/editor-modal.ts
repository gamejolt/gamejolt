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
		Aquarium: new ThemeModel('#00ffd2', '#00555f', '#ff4080'),
		Autumn: new ThemeModel('#ffe400', '#4c6f67', '#ff642e'),
		Cedar: new ThemeModel('#ffd052', '#93625c', '#00ff8a'),
		Diamondback: new ThemeModel('#f1ce71', '#807258', '#ff8400'),
		GlowPaint: new ThemeModel('#46ff76', '#512762', '#ff3b3b'),
		Hydraulic: new ThemeModel('#ff6c38', '#717171', '#ff9000'),
		JelPens: new ThemeModel('#00ffc0', '#775abd', '#ff009c'),
		Larkspur: new ThemeModel('#ffba00', '#003cab', '#ff00a8'),
		Mainsail: new ThemeModel('#fff65f', '#5f8698', '#ff5337'),
		Meadow: new ThemeModel('#00ffa8', '#006960', '#ff7e00'),
		Mochi: new ThemeModel('#a3ff78', '#537c40', '#ff6acc'),
		Seaplane: new ThemeModel('#a1b6df', '#5e6a94', '#ff5a00'),
		Shortcake: new ThemeModel('#cb8659', '#5b3821', '#ff4080'),
		Rose: new ThemeModel('#ff73bf', '#61639a', '#ff134b'),
		GarterSnake: new ThemeModel('#ff387a', '#5b7e79', '#13ffa9'),
		ToxicVHS: new ThemeModel('#ff4a9b', '#57874a', '#8df000'),
		Snowcone: new ThemeModel('#fffd6f', '#ab2956', '#5dd9be'),
		Lupin: new ThemeModel('#eda4ff', '#8759a7', '#ff237b'),
		Sherbet: new ThemeModel('#ffad56', '#942d4e', '#4bd67f'),
	};

	selectPreset(preset: ThemeModel) {
		Theme.theme.notice = preset.notice;
		Theme.theme.highlight = preset.highlight;
		Theme.theme.backlight = preset.backlight;
	}
}
