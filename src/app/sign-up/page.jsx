/* This page is sign-up page
    to be able to show this page, you need to navigate to /sign-up
*/


const SignUpPage = () => {
  return (
    <div>
      <button className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl">Responsive</button>
      <h1>Sign Up</h1>
      <form>
        <label>
          Email:
          <input type="email" name="email" required />
        </label>
        <label>
          Password:
          <input type="password" name="password" required />
        </label>
        <label>
          Confirm Password:
          <input type="password" name="confirmPassword" required />
        </label>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUpPage;
