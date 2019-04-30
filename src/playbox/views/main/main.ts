// import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
// import { Meta } from 'game-jolt-frontend-lib/components/meta/meta-service';
import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';

// type Payload = {
// 	error?: string;
// 	title?: string;
// 	description?: string;
// };

@Component({})
// @RouteResolver({
// 	async resolver(_data): Promise<Payload> {
// 		try {
// 			return await Api.sendRequest(`/playbox/hello`, null, {
// 				processPayload: false,
// 				detach: true,
// 			});
// 		} catch (e) {
// 			return { error: e.message };
// 		}
// 	},
// })
export default class RouteMain extends BaseRouteComponent {
	// routeResolved(payload: Payload) {
	// 	if (payload.error) {
	// 		console.error(payload.error);
	// 		return;
	// 	}
	// 	Meta.setTitle(payload.title!);
	// 	Meta.description = payload.description!;
	// }
}
