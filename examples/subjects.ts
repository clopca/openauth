import { object, string } from "valibot"
import { createSubjects } from "@clopca/openauth"

export const subjects = createSubjects({
  user: object({
    id: string(),
  }),
})
