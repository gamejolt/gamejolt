import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./test.html';

@View
@Component({
	name: 'route-test',
})
export default class RouteTest extends Vue
{
}
