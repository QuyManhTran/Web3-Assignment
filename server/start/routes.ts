/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const CrawlsController = () => import('#controllers/crawlers_controller')
const EventsController = () => import('#controllers/events_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const AuthController = () => import('#controllers/auth_controller')

router
    .group(() => {
        router.get('/crawls/mint', [CrawlsController, 'getMintEvents'])
        router
            .get('/events', [EventsController, 'index'])
            .use([middleware.auth({ guards: ['api'] }), middleware.pagination()])
        router
            .group(() => {
                router.get('/login', [AuthController, 'login'])
                router.post('/register', [AuthController, 'register'])
                router.post('/refresh', [AuthController, 'refresh'])
                router.post('/verify', [AuthController, 'verify'])
            })
            .prefix('/auth')
    })
    .prefix('/api/v1')
