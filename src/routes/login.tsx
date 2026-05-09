import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/login")({
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || "/home",
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth?.isAuthenticated) {
      throw redirect({ to: search.redirect });
    }
  },
  component: LoginComponent,
});

function LoginComponent() {
  const { redirect } = Route.useSearch();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Articulate</h1>
          <p className="text-muted-foreground mt-2">
            The fast-talking description game
          </p>
        </div>

        <Tabs defaultValue="sign-in">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="sign-in">
            <Card>
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                  Sign in to join or create a game
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignInForm redirectTo={redirect} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sign-up">
            <Card>
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                  Pick a name your teammates will know you by
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignUpForm redirectTo={redirect} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SignInForm({ redirectTo }: { redirectTo: string }) {
  const [serverError, setServerError] = useState("");

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      setServerError("");
      const result = await authClient.signIn.email(value);
      if (result.error) {
        setServerError(result.error.message ?? "Sign in failed");
      } else {
        window.location.href = redirectTo;
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <form.Field
        name="email"
        validators={{
          onBlur: ({ value }) =>
            !value
              ? "Required"
              : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                ? "Invalid email"
                : undefined,
        }}
      >
        {(field) => (
          <Field
            data-invalid={
              field.state.meta.isTouched && !field.state.meta.isValid
            }
          >
            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
            <Input
              id={field.name}
              type="email"
              placeholder="you@example.com"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.isTouched && (
              <FieldError
                errors={field.state.meta.errors.map((e) => ({
                  message: String(e),
                }))}
              />
            )}
          </Field>
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{
          onBlur: ({ value }) => (!value ? "Required" : undefined),
        }}
      >
        {(field) => (
          <Field
            data-invalid={
              field.state.meta.isTouched && !field.state.meta.isValid
            }
          >
            <FieldLabel htmlFor={field.name}>Password</FieldLabel>
            <Input
              id={field.name}
              type="password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.isTouched && (
              <FieldError
                errors={field.state.meta.errors.map((e) => ({
                  message: String(e),
                }))}
              />
            )}
          </Field>
        )}
      </form.Field>

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            className="w-full"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Signing in…" : "Sign In"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

function SignUpForm({ redirectTo }: { redirectTo: string }) {
  const [serverError, setServerError] = useState("");

  const form = useForm({
    defaultValues: { name: "", email: "", password: "" },
    onSubmit: async ({ value }) => {
      setServerError("");
      const result = await authClient.signUp.email(value);
      if (result.error) {
        setServerError(result.error.message ?? "Sign up failed");
      } else {
        window.location.href = redirectTo;
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <form.Field
        name="name"
        validators={{
          onBlur: ({ value }) => (!value ? "Required" : undefined),
        }}
      >
        {(field) => (
          <Field
            data-invalid={
              field.state.meta.isTouched && !field.state.meta.isValid
            }
          >
            <FieldLabel htmlFor={field.name}>Display name</FieldLabel>
            <Input
              id={field.name}
              placeholder="e.g. Jamie"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.isTouched && (
              <FieldError
                errors={field.state.meta.errors.map((e) => ({
                  message: String(e),
                }))}
              />
            )}
          </Field>
        )}
      </form.Field>

      <form.Field
        name="email"
        validators={{
          onBlur: ({ value }) =>
            !value
              ? "Required"
              : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                ? "Invalid email"
                : undefined,
        }}
      >
        {(field) => (
          <Field
            data-invalid={
              field.state.meta.isTouched && !field.state.meta.isValid
            }
          >
            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
            <Input
              id={field.name}
              type="email"
              placeholder="you@example.com"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.isTouched && (
              <FieldError
                errors={field.state.meta.errors.map((e) => ({
                  message: String(e),
                }))}
              />
            )}
          </Field>
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{
          onBlur: ({ value }) =>
            !value
              ? "Required"
              : value.length < 8
                ? "At least 8 characters"
                : undefined,
        }}
      >
        {(field) => (
          <Field
            data-invalid={
              field.state.meta.isTouched && !field.state.meta.isValid
            }
          >
            <FieldLabel htmlFor={field.name}>Password</FieldLabel>
            <Input
              id={field.name}
              type="password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.isTouched && (
              <FieldError
                errors={field.state.meta.errors.map((e) => ({
                  message: String(e),
                }))}
              />
            )}
          </Field>
        )}
      </form.Field>

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            className="w-full"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Creating account…" : "Create Account"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
