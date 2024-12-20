/** @jsxImportSource hono/jsx */

import {
  PasswordChangeError,
  PasswordConfig,
  PasswordLoginError,
  PasswordRegisterError,
} from "../adapter/password.js";
import { Layout } from "./base.js";
import "./form.js";
import { FormAlert } from "./form.js";

const DEFAULT_COPY = {
  error_email_taken: "Ya hay una cuenta con este email.",
  error_invalid_code: "El código es incorrecto.",
  error_invalid_email: "El email no es válido.",
  error_invalid_password: "La contraseña es incorrecta.",
  error_password_mismatch: "Las contraseñas no coinciden.",
  error_invalid_name: "El nombre no es válido.",
  error_invalid_lastName: "El apellido no es válido.",
  error_invalid_phone: "El número de teléfono no es válido.",
  register_title: "Bienvenido a Crediteame",
  register_description: "Inicia sesión con tu email",
  login_title: "Bienvenido a Crediteame",
  login_description: "Inicia sesión con tu email",
  register: "Registrarse",
  register_prompt: "¿No tienes cuenta?",
  login_prompt: "¿Ya tienes cuenta?",
  login: "Iniciar sesión",
  change_prompt: "¿Olvidaste tu contraseña?",
  code_resend: "Reenviar código",
  code_return: "Volver a iniciar sesión",
  logo: "Crediteame",
  input_email: "Email",
  input_password: "Contraseña",
  input_name: "Nombre",
  input_lastName: "Apellido",
  input_phone: "Número de teléfono",
  input_code: "Código",
  input_repeat: "Repite la contraseña",
  button_continue: "Continuar",
} satisfies {
  [key in `error_${
    | PasswordLoginError["type"]
    | PasswordRegisterError["type"]
    | PasswordChangeError["type"]}`]: string;
} & Record<string, string>;

export type PasswordUICopy = typeof DEFAULT_COPY;

export interface PasswordUIOptions {
  sendCode: PasswordConfig["sendCode"];
  copy?: Partial<PasswordUICopy>;
}

export function PasswordUI(input: PasswordUIOptions) {
  const copy = {
    ...DEFAULT_COPY,
    ...input.copy,
  };
  return {
    sendCode: input.sendCode,
    login: async (_req, form, error): Promise<Response> => {
      const jsx = (
        <Layout>
          <form data-component="form" method="post">
            <meta charSet="UTF-8" />
            <FormAlert message={error?.type && copy?.[`error_${error.type}`]} />
            <input
              data-component="input"
              type="email"
              name="email"
              required
              placeholder={copy.input_email}
              autofocus={!error}
              value={form?.get("email")?.toString()}
            />
            <input
              data-component="input"
              autofocus={error?.type === "invalid_password"}
              required
              type="password"
              name="password"
              placeholder={copy.input_password}
              autoComplete="current-password"
            />
            <button data-component="button">{copy.button_continue}</button>
            <div data-component="form-footer">
              <span>
                {copy.register_prompt}{" "}
                <a data-component="link" href="register">
                  {copy.register}
                </a>
              </span>
              <a data-component="link" href="change">
                {copy.change_prompt}
              </a>
            </div>
          </form>
        </Layout>
      );
      return new Response(jsx.toString(), {
        status: error ? 401 : 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    },
    register: async (_req, state, form, error): Promise<Response> => {
      const emailError = ["invalid_email", "email_taken"].includes(
        error?.type || ""
      );
      const passwordError = ["invalid_password", "password_mismatch"].includes(
        error?.type || ""
      );
      const nameError = ["invalid_name"].includes(error?.type || "");
      const lastNameError = ["invalid_lastname"].includes(error?.type || "");
      const phoneError = ["invalid_phone"].includes(error?.type || "");
      const jsx = (
        <Layout>
          <form data-component="form" method="post">
            <meta charSet="UTF-8" />
            <FormAlert message={error?.type && copy?.[`error_${error.type}`]} />
            {state.type === "start" && (
              <>
                <input type="hidden" name="action" value="register" />
                <input
                  data-component="input"
                  autofocus={!error || emailError}
                  type="email"
                  name="email"
                  value={!emailError ? form?.get("email")?.toString() : ""}
                  required
                  placeholder={copy.input_email}
                />
                <input
                  data-component="input"
                  autofocus={passwordError}
                  type="password"
                  name="password"
                  placeholder={copy.input_password}
                  required
                  value={
                    !passwordError ? form?.get("password")?.toString() : ""
                  }
                  autoComplete="new-password"
                />
                <input
                  data-component="input"
                  type="password"
                  name="repeat"
                  required
                  autofocus={passwordError}
                  placeholder={copy.input_repeat}
                  autoComplete="new-password"
                />
                <input
                  data-component="input"
                  autofocus={nameError}
                  type="text"
                  name="name"
                  required
                  placeholder={copy.input_name}
                  value={!nameError ? form?.get("name")?.toString() : ""}
                />
                <input
                  data-component="input"
                  autofocus={lastNameError}
                  type="text"
                  name="lastName"
                  required
                  placeholder={copy.input_lastName}
                  value={
                    !lastNameError ? form?.get("lastName")?.toString() : ""
                  }
                />
                <input
                  data-component="input"
                  autofocus={phoneError}
                  type="tel"
                  name="phone"
                  required
                  placeholder={copy.input_phone}
                  value={!phoneError ? form?.get("phone")?.toString() : ""}
                />
                <button data-component="button">{copy.button_continue}</button>
                <div data-component="form-footer">
                  <span>
                    {copy.login_prompt}{" "}
                    <a data-component="link" href="authorize">
                      {copy.login}
                    </a>
                  </span>
                </div>
              </>
            )}

            {state.type === "code" && (
              <>
                <input type="hidden" name="action" value="verify" />
                <input
                  data-component="input"
                  autofocus
                  name="code"
                  minLength={6}
                  maxLength={6}
                  required
                  placeholder={copy.input_code}
                  autoComplete="one-time-code"
                />
                <button data-component="button">{copy.button_continue}</button>
              </>
            )}
          </form>
        </Layout>
      ) as string;
      return new Response(jsx.toString(), {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    },
    change: async (_req, state, form, error): Promise<Response> => {
      const passwordError = ["invalid_password", "password_mismatch"].includes(
        error?.type || ""
      );
      const jsx = (
        <Layout>
          <form data-component="form" method="post" replace>
            <meta charSet="UTF-8" />
            <FormAlert message={error?.type && copy?.[`error_${error.type}`]} />
            {state.type === "start" && (
              <>
                <input type="hidden" name="action" value="code" />
                <input
                  data-component="input"
                  autofocus
                  type="email"
                  name="email"
                  required
                  value={form?.get("email")?.toString()}
                  placeholder={copy.input_email}
                />
              </>
            )}
            {state.type === "code" && (
              <>
                <input type="hidden" name="action" value="verify" />
                <input
                  data-component="input"
                  autofocus
                  name="code"
                  minLength={6}
                  maxLength={6}
                  required
                  placeholder={copy.input_code}
                  autoComplete="one-time-code"
                />
              </>
            )}
            {state.type === "update" && (
              <>
                <input type="hidden" name="action" value="update" />
                <input
                  data-component="input"
                  autofocus
                  type="password"
                  name="password"
                  placeholder={copy.input_password}
                  required
                  value={
                    !passwordError ? form?.get("password")?.toString() : ""
                  }
                  autoComplete="new-password"
                />
                <input
                  data-component="input"
                  type="password"
                  name="repeat"
                  required
                  value={
                    !passwordError ? form?.get("password")?.toString() : ""
                  }
                  placeholder={copy.input_repeat}
                  autoComplete="new-password"
                />
              </>
            )}
            <button data-component="button">{copy.button_continue}</button>
          </form>
          {state.type === "code" && (
            <form method="post">
              <input type="hidden" name="action" value="code" />
              <input type="hidden" name="email" value={state.email} />
              {state.type === "code" && (
                <div data-component="form-footer">
                  <span>
                    {copy.code_return}{" "}
                    <a data-component="link" href="authorize">
                      {copy.login.toLowerCase()}
                    </a>
                  </span>
                  <button data-component="link">{copy.code_resend}</button>
                </div>
              )}
            </form>
          )}
        </Layout>
      );
      return new Response(jsx.toString(), {
        status: error ? 400 : 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    },
  } satisfies PasswordConfig;
}
