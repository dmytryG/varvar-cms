import * as yup from "yup"

export const registerSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(6).max(100).required(),
})

export const loginSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
})

export const setRoleSchema = yup.object({
  userId: yup.string().required(),
  role: yup.string().oneOf(["ADMIN", "USER"]).required(),
})
