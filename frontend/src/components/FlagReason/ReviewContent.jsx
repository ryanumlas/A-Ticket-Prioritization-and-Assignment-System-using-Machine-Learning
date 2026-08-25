import LowConfidenceReview from "./LowConfidenceReview";
import MissingDepartmentReview from "./MissingDepartmentReview";
import UnclearDescriptionReview from "./UnclearDescriptionReview";
// import OtherReview from "./OtherReview";

export default function ReviewContent({ flag }) {
    switch (flag.reason) {
        case "Low Confidence":
            return <LowConfidenceReview flag={flag} />;

        case "Missing Department":
            return <MissingDepartmentReview flag={flag} />;

        case "Unclear Description":
            return <UnclearDescriptionReview flag={flag} />;

        case "other":
            return <div>asjodhsaiudasd</div>;

        default:
            return null;
    }
}