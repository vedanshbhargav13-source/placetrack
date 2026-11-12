function StatusBadge(props) {

    const status = props.status;
    
    let color = "";
    if(status == "Applied") color = "bg-blue-500";
    else if(status == "OA") color = "bg-yellow-500";
    else if(status == "Interview") color = "bg-purple-500";
    else if(status == "Selected") color = "bg-green-500";
    else if(status == "Rejected") color = "bg-red-500";
    else color = "bg-gray-500";

    return (
        <span className = {`${color} text-white px-3 py-1 rounded-full text-sm`}>
            {status}
        </span>
    )

}

export default StatusBadge; 