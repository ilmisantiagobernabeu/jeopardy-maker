import axios from "axios";
import { PageWrapper } from "./PageWrapper";
import { useGlobalState } from "./GlobalStateProvider";
import { useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../api/constants";

export const Contact = () => {
  const { session } = useGlobalState();
  const [email, setEmail] = useState(session?.user.email || "");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [amRobot, setAmRobot] = useState(true);
  const [showThanks, setShowThanks] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(`${apiUrl}/api/contact`, {
        email,
        body: feedback,
      });
      setShowThanks(true);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setIsLoading(false);
  };

  return (
    <PageWrapper>
      <div className="GameCard w-full max-w-lg">
        <h2 className="font-bold text-2xl leading-none text-center normal-case mb-2">
          Contact
        </h2>
        {showThanks ? (
          <div className="flex flex-col gap-2">
            <p className="text-center normal-case text-lg mb-4">
              Thanks! We'll get back to you soon.
            </p>
            <Link className="primary-btn" to="/">
              Back to homepage
            </Link>
          </div>
        ) : (
          <>
            <p className="text-center normal-case text-lg mb-4">
              Please let us know how to make Buzzinga better!
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="text"
                  className="appearance-none rounded-sm p-2 text-base text-black"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="feedback">
                  Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="feedback"
                  className="min-h-[200px] appearance-none rounded-sm p-2 text-base text-black"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="checkbox"
                  checked={!amRobot}
                  onChange={() => setAmRobot((prev) => !prev)}
                  required
                />
                <label htmlFor="robot">
                  I hereby certify that I am not a robot{" "}
                  <span className="text-red-500">*</span>
                </label>
              </div>
              <button
                type="submit"
                className="primary-btn"
                disabled={amRobot || isLoading || !email || !feedback}
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </PageWrapper>
  );
};
