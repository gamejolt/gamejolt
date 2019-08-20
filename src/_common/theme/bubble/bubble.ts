import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import './bubble-global.styl';

@Component({})
export default class AppThemeBubble extends Vue {
	@Prop(String)
	highlight!: string;

	@Prop(String)
	backlight?: string;

	@Prop(Boolean)
	active?: boolean;
}
