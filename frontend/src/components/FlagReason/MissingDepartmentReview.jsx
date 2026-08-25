export default function MissingDepartmentReview({ flag }) {
    return (
        <div>
            <h2>Department Assignment</h2>

            <p>
                Symptom: {flag.symptom_code}
            </p>

            <p>
                Category: {flag.category}
            </p>

            <select>
                <option>Select Department</option>
            </select>

            <button>
                Assign Department
            </button>
        </div>
    );
}