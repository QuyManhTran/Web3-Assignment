import vine from '@vinejs/vine'

export const AuthValidator = vine.compile(
    vine.object({
        publicAddress: vine.string().minLength(42).maxLength(42),
    })
)

export const AuthVerifyValidator = vine.compile(
    vine.object({
        publicAddress: vine.string().minLength(42).maxLength(42),
        signature: vine.string().minLength(0),
    })
)
