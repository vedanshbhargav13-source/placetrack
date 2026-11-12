
import StatusBadge from "./StatusBadge";

function ApplicationCard(props) {
  const company = props.company;
  const role = props.role;
  const status = props.status;
  const deadline = props.deadline;
  const onDelete = props.onDelete;
  const id = props.id;

  return (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{company}</h2>
        <StatusBadge status={status} />
      </div>

      <p className="text-gray-600 mt-2">{role}</p>

      <p className="text-sm text-gray-500 mt-4">
        Deadline: {deadline}
      </p>

      <button
        onClick={() => onDelete(id)}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
      >
        Remove
      </button>
    </div>
  );
}

export default ApplicationCard;
