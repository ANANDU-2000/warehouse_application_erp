import { Link } from "react-router-dom";
import "./PostAuthStub.css";

type PostAuthStubProps = {
  title: string;
  pathLabel: string;
};

/**
 * Minimal post-login target — Dashboard not built (docs/06 backend gate).
 */
export function PostAuthStub({ title, pathLabel }: PostAuthStubProps) {
  return (
    <div className="post-auth-stub">
      <h1 className="post-auth-stub__title">{title}</h1>
      <p className="post-auth-stub__body">
        Dashboard not built — backend-gated ({pathLabel}). Login WIRE stub only.
      </p>
      <Link to="/login" className="post-auth-stub__link">
        Back to Sign In
      </Link>
    </div>
  );
}

export function HomeStubPage() {
  return <PostAuthStub title="Home" pathLabel="/home" />;
}

export function StaffHomeStubPage() {
  return <PostAuthStub title="Staff Home" pathLabel="/staff/home" />;
}
