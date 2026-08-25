export default function UnclearDescriptionReview({ flag }) {
    return (
        <div>
            <h2>Description Review</h2>

            <div>
                <p>AI Summary</p>
                <p>{flag.summary}</p>
            </div>
            
            <div>
                <p>Business Critical</p>
                <p>{flag.business_critical}</p>
            </div>

            <button>
                Manually Classify
            </button>

            <button>
                Return to Employee
            </button>
        </div>
    );
}