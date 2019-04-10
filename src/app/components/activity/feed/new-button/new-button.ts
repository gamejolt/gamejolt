import Vue from 'vue';
import { Component, Emit } from 'vue-property-decorator';

@Component({})
export default class AppActivityFeedNewButton extends Vue {
	@Emit('click')
	emitClick(_e: Event) {}
}
