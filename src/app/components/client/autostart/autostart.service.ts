import { Settings } from '../../settings/settings.service';
import { Autostarter } from 'client-voodoo';
import { Device } from '../../../../lib/gj-lib-client/components/device/device.service';

export class ClientAutoStart
{
	static init()
	{
		if ( Settings.get( 'autostart-client' ) ) {
			this.set();
		}
	}

	static canAutoStart()
	{
		return GJ_BUILD_TYPE === 'production' && Device.os() === 'windows';
	}

	static async set()
	{
		if ( !this.canAutoStart() ) {
			return;
		}

		return Autostarter.set( process.execPath, [ '--silent-start' ] );
	}

	static async clear()
	{
		if ( !this.canAutoStart() ) {
			return;
		}

		return Autostarter.unset();
	}

	static async check()
	{
		if ( !this.canAutoStart() ) {
			return;
		}

		return Autostarter.isset();
	}
}
