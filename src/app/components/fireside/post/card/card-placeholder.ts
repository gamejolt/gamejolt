import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { AppPostCardAspectRatio } from './card';

@Component({})
export default class AppPostCardPlaceholder extends Vue {
	readonly aspectRatio = AppPostCardAspectRatio;
}
