import * as yup from "yup"

export const setRoleSchema = yup.object({
  userId: yup.string().required(),
  role: yup.string().oneOf(["ADMIN", "USER"]).required(),
})

export const deleteUserSchema = yup.object({
    userId: yup.string().required(),
})
