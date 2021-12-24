/**
 * This module allows us to export client-related code safely. It'll get cleaned
 * out when doing a web build and all the exports will be undefined. In the
 * client, they'll be defined with their proper types. Use these exports when
 * interfacing with client code outside of client-specific code.
 */

import type { Client as ClientType } from './client.service';

const Client = GJ_IS_CLIENT ? (require('./client.service').Client as typeof ClientType) : null;

export { Client };
