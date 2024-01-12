import axios from "axios";
import { useState } from "react";
import { Rating } from "react-simple-star-rating";
import { apiUrl } from "../api/constants";

type FeedbackRatingProps = {
  onRequestClose: () => void;
};

export const FeedbackRating = ({ onRequestClose }: FeedbackRatingProps) => {
  const [showThanks, setShowThanks] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(`${apiUrl}/api/contact`, {
        email: ``,
        body: `Rating: ${rating}. Feedback: ${feedback}`,
        subject: `Post game feedback from game ${localStorage.getItem(
          "bz-roomId"
        )}`,
      });
      setShowThanks(true);
      setIsLoading(false);
      localStorage.setItem("bz-feedbackSubmittedDate", new Date().toString());
    } catch (error) {
      console.error("Error fetching users:", error);
      setIsLoading(false);
    }
  };

  // Catch Rating value
  const handleRating = (rate: number) => {
    setRating(rate);

    // other logic
  };
  // Optinal callback functions
  const onPointerEnter = () => console.log("Enter");
  const onPointerLeave = () => console.log("Leave");
  const onPointerMove = (value: number, index: number) =>
    console.log(value, index);

  if (showThanks) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-center normal-case text-3xl mb-4">
          Thanks for your feedback!
        </p>
        <button className="primary-btn" onClick={onRequestClose}>
          Back to buzzer
        </button>
      </div>
    );
  }
  return (
    <form className="inline-flex flex-col gap-2" onSubmit={handleSubmit}>
      <h3 className="text-2xl">How was your experience?</h3>
      <div className="flex justify-center">
        <Rating
          size={60}
          initialValue={rating}
          onClick={handleRating}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onPointerMove={onPointerMove}
          SVGclassName={"inline-block"}
          emptyClassName="color-[#ff0000]"
          /* Available Props */
        />
      </div>
      {rating > 0 && (
        <div className="flex flex-col gap-4">
          <textarea
            aria-label="Additional feedback"
            id="feedback"
            className="min-h-[200px] appearance-none rounded-sm p-2 text-base text-black"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Any other feedback (optional)"
          />
          <button
            className="primary-btn !w-auto"
            disabled={!rating || isLoading}
          >
            Submit
          </button>
        </div>
      )}
    </form>
  );
};
