import * as yup from "yup"

export const updatePageDataSchema = yup.object({
  data: yup.object().required(),
})

export const pageDefining = yup.object({
  slug: yup.string().min(1).max(100).required(),
  language: yup.string().min(2).max(5).required(),
  projectSlug: yup.string().min(1).max(100).required(),
})

export const projectSlugRequired = yup.object({
    projectSlug: yup.string().required(),
})

export const idRequired = yup.object({
    id: yup.string().required(),
})