import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { Navigate } from 'game-jolt-frontend-lib/components/navigate/navigate.service';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';

export default class SectionService {
	private static translateRouteName(routeName: string): string {
		switch (routeName) {
			case 'discover.home':
				return 'discover';
			case 'auth.login':
				return 'login';
			case 'new-user.avatar':
				return 'new-user';
		}

		throw new Error('No translation defined for route name ' + routeName);
	}

	public static redirectTo(routeName: string): void {
		const translated = this.translateRouteName(routeName);
		Navigate.goto(Environment.baseUrl + '/' + translated);
	}

	public static redirectToUser(user: User): void {
		Navigate.goto(Environment.baseUrl + '/@' + user.username);
	}
}
