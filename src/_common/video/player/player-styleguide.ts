import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppVideoPlayer from './player.vue';

@Component({
	components: {
		AppVideoPlayer,
	},
})
export default class AppVideoPlayerStyleguide extends Vue {}
