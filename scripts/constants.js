/**
 * Module-based constants
 */
export const MODULE = {
    ID: 'token-action-hud-crookedfalls'
}

/**
 * Core module
 */
export const CORE_MODULE = {
    ID: 'token-action-hud-core'
}

/**
 * Core module version required by the system module
 */
export const REQUIRED_CORE_MODULE_VERSION = '2.0'

/**
 * Action types
 */
export const ACTION_TYPE = {
    pool:         'tokenActionHud.crookedfalls.pool',
    fogDefense:   'tokenActionHud.crookedfalls.fogDefense',
    tag:          'tokenActionHud.crookedfalls.tag',
    power:        'tokenActionHud.crookedfalls.power',
    interference: 'tokenActionHud.crookedfalls.interference',
    utility:      'tokenActionHud.utility'
}

/**
 * Groups
 */
export const GROUP = {
    pools:        { id: 'pools',        name: 'tokenActionHud.crookedfalls.pools',        type: 'system' },
    fogDefense:   { id: 'fogDefense',   name: 'tokenActionHud.crookedfalls.fogDefense',   type: 'system' },
    tags:         { id: 'tags',         name: 'tokenActionHud.crookedfalls.tags',          type: 'system' },
    items:        { id: 'items',        name: 'tokenActionHud.crookedfalls.items',         type: 'system' },
    powers:       { id: 'powers',       name: 'tokenActionHud.crookedfalls.powers',        type: 'system' },
    interference: { id: 'interference', name: 'tokenActionHud.crookedfalls.interference',  type: 'system' },
    combat:       { id: 'combat',       name: 'tokenActionHud.combat',                     type: 'system' },
    token:        { id: 'token',        name: 'tokenActionHud.token',                      type: 'system' },
    utility:      { id: 'utility',      name: 'tokenActionHud.utility',                    type: 'system' }
}
