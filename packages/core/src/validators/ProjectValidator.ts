import * as yup from "yup"

export const createProjectSchema = yup.object({
  slug: yup.string().min(1).max(100).matches(/^[a-z0-9-_]+$/, "Slug can only contain lowercase letters, numbers, hyphens and underscores").required(),
  name: yup.string().min(1).max(200).required(),
  description: yup.string().max(1000).optional(),
})

export const updateProjectSchema = yup.object({
  name: yup.string().min(1).max(200).optional(),
  description: yup.string().max(1000).optional(),
})

export const projectParamsSchema = yup.object({
  id: yup.string().matches(/^[0-9a-fA-F]{24}$/, "Invalid project ID").required(),
})
