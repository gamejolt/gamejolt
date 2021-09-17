import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { Fireside } from '../../../../../_common/fireside/fireside.model';

/**
 * This is a thin wrapper around showing a fireside preview video.
 *
 * IMPORTANT: Make sure to not load any agora stuff in here, it all has to be
 * lazy loaded.
 */
@Component({
	components: {
		AppFiresideStreamPreviewVideo: () => import('./video.vue'),
	},
})
export default class AppFiresideStreamPreview extends Vue {
	@Prop({ type: Fireside, required: true })
	fireside!: Fireside;

	@Prop({ type: Boolean, required: false, default: true })
	showLive!: Fireside;

	@Emit('changed') emitChanged(_hasVideo: boolean, _isStreaming: boolean) {}

	get location() {
		return this.fireside.location;
	}

	onVideoChanged(hasVideo: boolean, isStreaming: boolean) {
		this.emitChanged(hasVideo, isStreaming);
	}
}
