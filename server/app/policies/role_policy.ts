import { UserRoles } from '#enums/user'
import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class RolePolicy extends BasePolicy {
    isRightRole(user: User, roles: UserRoles[]): AuthorizerResponse {
        return roles.includes(user.role)
    }
}
