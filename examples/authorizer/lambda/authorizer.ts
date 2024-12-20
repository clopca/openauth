import { authorizer } from "@clopca/openauth"
import { handle } from "hono/aws-lambda"
import { DynamoStorage } from "@clopca/openauth/storage/dynamo"
import { subjects } from "../../subjects.js"
import { Resource } from "sst"
import { PasswordAdapter } from "@clopca/openauth/adapter/password"
import { PasswordUI } from "@clopca/openauth/ui/password"

async function getUser(email: string) {
  // Get user from database
  // Return user ID
  return "123"
}

const app = authorizer({
  storage: DynamoStorage({
    table: Resource.LambdaAuthTable.name,
  }),
  subjects,
  providers: {
    password: PasswordAdapter(
      PasswordUI({
        sendCode: async (email, code) => {
          console.log(email, code)
        },
      }),
    ),
  },
  success: async (ctx, value) => {
    if (value.provider === "password") {
      return ctx.subject("user", {
        id: await getUser(value.email),
      })
    }
    throw new Error("Invalid provider")
  },
})

// @ts-ignore
export const handler = handle(app)
