import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../../../utils/vue';
import { number } from '../../../../../_common/filters/number';

@Component({})
export default class AppShellCbarItem extends Vue {
	@Prop(propOptional(Boolean, false)) isActive!: boolean;
	@Prop(propOptional(Boolean, false)) isUnread!: boolean;
	@Prop(propOptional(Boolean, false)) isControl!: boolean;
	@Prop(propOptional(String)) highlight?: string;
	@Prop(propOptional(Number, 0)) notificationCount!: number;

	get notificationCountText() {
		return this.notificationCount > 99 ? '99+' : number(this.notificationCount);
	}
}
