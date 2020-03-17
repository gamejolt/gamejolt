import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';

@Component({})
export default class AppActivityFeedEventItemBlocked extends Vue {
	@Prop(propRequired(String)) username!: string;

	@Emit('show') show() {}
}
