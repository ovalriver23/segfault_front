/* This page is sign-in page
    to be able to show this page, you need to navigate to /sign-in
*/


const SignInPage = () => {
  return (
    <div>
      <h1 className="font-bold text-red-500 m-4">Sign In</h1>
      <form>
        <label>
          Email:
          <input type="email" name="email" required />
        </label>
        <label>
          Password:
          <input type="password" name="password" required />
        </label>
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};

export default SignInPage;