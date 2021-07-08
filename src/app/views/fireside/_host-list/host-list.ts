import Vue from 'vue';
import { Component, Emit, InjectReactive } from 'vue-property-decorator';
import { FiresideRTC, FiresideRTCKey } from '../fireside-rtc';
import AppFiresideHostAvatar from '../_host-avatar/host-avatar.vue';

@Component({
	components: {
		AppFiresideHostAvatar,
	},
})
export default class AppFiresideHostList extends Vue {
	@InjectReactive(FiresideRTCKey) rtc!: FiresideRTC;

	@Emit('change-host') emitChangeHost() {}
}
