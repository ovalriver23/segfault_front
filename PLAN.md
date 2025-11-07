# Sign-In Form Submission Integration Plan

- **Schema alignment**
	- Rename the `mail` field in `SignInSchema` and component state to `email` so the schema matches the actual form input name.
	- Extend the Zod schema if we want client-side password rules (length, character mix) and surface any validation errors in the UI.

- **Form management with React Hook Form + Zod**
	- Introduce `react-hook-form` with `@hookform/resolvers/zod` to manage the login form state and validations.
	- Replace manual `useState` calls for email/password with `useForm` helpers and display inline field errors from `formState.errors`.
	- Keep the password visibility toggle controlled separately from the form values.

- **Submission lifecycle state**
	- Use the `isSubmitting` flag from React Hook Form to disable the submit button and show a loading state while the request is in flight.
	- Provide a general error message area that displays backend errors when the API call fails.

- **API proxy for sign-in**
	- Implement `POST /api/auth/signin` in `src/app/api/auth/signin/route.ts`, mirroring the existing sign-up proxy but targeting `${BACKEND_API_URL}/api/auth/signin`.
	- Forward `Set-Cookie` headers and handle non-JSON or network failures with meaningful responses.

- **Wire the page to the API**
	- In the login page, call `fetch('/api/auth/signin')` within `handleSubmit` and branch on the response status.
	- On success, persist any returned auth data (or leave a TODO if global auth state management is not yet defined) and redirect to the post-login destination.
	- On failure, populate the general error area with the backend message.

- **Post-login redirect & UX polish**
	- Use `useRouter` to navigate to `/dashboard` (or the appropriate destination) after a successful response.
	- Ensure loading and error states reset appropriately when the user edits the form.

- **Testing checklist**
	- Attempt submissions with empty/invalid inputs to confirm Zod validation.
	- Verify the loading state disables buttons and prevents duplicate submissions.
	- Test both successful and failed API responses to confirm messaging and cookie forwarding work as expected.
