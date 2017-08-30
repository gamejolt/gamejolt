import * as os from 'os';
import * as path from 'path';

export abstract class ClientInfo {
	private static getPackageJson() {
		const cwd = path.dirname(process.mainModule!.filename);

		// Slightly different path on dev and mac.
		let packagePath = path.resolve(cwd, '..', 'package.json');
		if (GJ_BUILD_TYPE === 'development' || os.type() === 'Darwin') {
			packagePath = path.resolve(cwd, 'package.json');
		}

		return require(packagePath);
	}

	static getVersion(): string {
		return this.getPackageJson().version;
	}
}
