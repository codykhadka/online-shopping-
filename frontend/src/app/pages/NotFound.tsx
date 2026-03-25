import { Link } from "react-router";
import { Button } from "../components/ui/button";
import "@/styles/NotFound.css";

export function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page Not Found</h2>
        <p className="not-found-text">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/login">
          <Button size="lg">Back to Login</Button>
        </Link>
      </div>
    </div>
  );
}
