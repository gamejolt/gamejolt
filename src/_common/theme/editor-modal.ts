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
	};

	selectPreset(preset: ThemeModel) {
		Theme.theme.notice = preset.notice;
		Theme.theme.highlight = preset.highlight;
		Theme.theme.backlight = preset.backlight;
	}
}
