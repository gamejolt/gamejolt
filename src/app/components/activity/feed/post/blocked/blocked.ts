import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

@Component({})
export default class AppActivityFeedPostBlocked extends Vue {
	@Prop({ type: String, required: true })
	username!: string;

	@Emit('show') show() {}
}
