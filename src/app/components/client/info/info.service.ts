import * as os from 'os';
import * as path from 'path';

export class ClientInfo
{
	private static _packageVersion = '';

	static init()
	{
		const cwd = path.dirname( process.mainModule!.filename );

		// Slightly different path on dev and mac.
		let packagePath = path.resolve( cwd, '..', 'package.json' );
		if ( GJ_BUILD_TYPE === 'development' || os.type() === 'Darwin' ) {
			packagePath = path.resolve( cwd, 'package.json' );
		}

		this._packageVersion = require( packagePath ).version;
	}

	static get version()
	{
		return this._packageVersion;
	}
}
