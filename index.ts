import { App } from './app';

new App()
    .initialize()
    .then((app) => app.start(2000, 'Server started'));