import EventEmitter from 'events'

// Creamos una única instancia de EventEmitter para usarla en toda la aplicación.
export const appEventEmitter = new EventEmitter()
