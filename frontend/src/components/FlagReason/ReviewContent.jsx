import LowConfidenceReview from "./LowConfidenceReview";
import MissingDepartmentReview from "./MissingDepartmentReview";
import UnclearDescriptionReview from "./UnclearDescriptionReview";
import PriorityAssessmentReview from "./PriorityAssessmentReview";
// import OtherReview from "./OtherReview";

export default function ReviewContent({ flag }) {
    switch (flag.reason) {
        case "Low Confidence":
            return <LowConfidenceReview flag={flag} />;

        case "Priority Assessment":
            return <PriorityAssessmentReview flag={flag} />;

        case "Unclear Description":
            return <UnclearDescriptionReview flag={flag} />;

        case "other":
            return <div>asjodhsaiudasd</div>;

        default:
            return null;
    }
}